import { Browser, Page } from 'puppeteer-core';
import youtubedl, { YtResponse } from 'youtube-dl-exec';
import config from './config';

const youtubeConf = {
  dumpJson: true,
  noWarnings: true,
  noCallHome: true,
  extractAudio: true,
  audioFormat: 'vorbis',
  noCheckCertificate: true,
  preferFreeFormats: true,
  defaultSearch: 'ytsearch',
  youtubeSkipDashManifest: true,
}

interface IIncomingMessage {
  from: string, // The id of the user that sent the message
  nick: string, // the nickname of the user that sent the message
  privateMessage: boolean, // whether this is a private or group message
  message: string // the text of the message
}

interface IParticipantKickedOut {
  kicked: {
    id: string, // the id of the participant removed from the room
    local: boolean // whether or not the participant is the local particiapnt
  },
  kicker: {
    id: string // the id of the participant who kicked out the other participant
  }
}

type ExposableFunction = (arg0: any) => any;

export class JitsiBot {
  private queue = <YtResponse[]> [];

  private constructor(private page: Page) {
    void this.exposeListenerFunction(this.participantKickedOut);
    void this.exposeListenerFunction(this.videoConferenceJoined);
    void this.exposeListenerFunction(this.onAudioEnded);
  }

  /**
   * Initializationfunction of the bot, to circumvent an ansync contructor.
   * This function will load a jitsi meeting, join a given conference and
   * bind some functions to listen to the jitsi event api.
   *
   * @param browser - The browser object to utilize
   * @param room - Name of the room to join
   * @param botName - The display name of the bot
   * @returns - Promise of the JitsiBot instance
   */
  static async init(browser: Browser, roomName: string, botName: string): Promise<JitsiBot> {
    const page = await browser.newPage();
    const url = `file://${__dirname}/../index.html`;

    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(`joinConference('${roomName}', '${botName}')`);

    return new JitsiBot(page);
  }

  /**
   * Wait until bot joined into the meeting. Then unregister the dummy message
   * listener and register the real one. This is used to circumvent unread
   * messages on join.
   */
  private async videoConferenceJoined(): Promise<void> {
    await this.exposeFunction(this.incomingMessage);
    await this.removeEventListener(this.incomingMessage, 'dummyMessageListener');
    await this.addEventListener(this.incomingMessage);
    // open chat, so messages can be sent
    await this.page.evaluate('api.executeCommand("toggleChat")');
  }

  /**
   * Listen to incoming chat messages. Used to detect bot commands.
   *
   * @param event - The message event
   */
  private async incomingMessage(event: IIncomingMessage): Promise<void> {
    const [cmd, ...params] = event.message.split(' ');
    switch (cmd) {
      case '!add':
        if (params.length) {
          if (this.queue.length >= config.playlist.maxSize) {
            void this.sendMessage(`Sorry, I cannot remember more than ${config.playlist.maxSize} tracks :confounded_face:`)
          }
          const track = await this.fetchAudio(params.join(' '));
          this.queue.push(track);
          if(await this.page.evaluate('audio.ended || audio.currentTime === 0')) {
            await this.onAudioEnded();
          }
        }
        break;
      case '!clear':
        this.queue = [];
        break;
      case '!help':
        void this.sendMessages([
          '!add <url|searchTerm> - Add track to queue',
          '!clear - Clear the queue',
          '!list - Show tracks in queue',
          '!ping - Ping me!',
          '!play <url|searchTerm> - Play track now, or resume if no params were given',
        ]);
        break;
      case '!list':
        void this.sendMessages(this.queue.map((track) => track.title));
        break;
      case '!pause':
        await this.page.evaluate('void audio.pause()');
        break;
      case '!ping':
        await this.sendMessage('Pong!');
        break;
      case '!play':
        if (params.length === 0) {
          await this.page.evaluate('void audio.play()');
        } else {
          const track = await this.fetchAudio(params.join(' '));
          await this.playAudio(track);
        }
        break;
    }
  }

  /**
   * Called each time the audio element ends its current track.
   * Responsible for adding the next item from the queue.
   */
  private async onAudioEnded(): Promise<void> {
    if (!this.queue.length) return;
    const track = this.queue.shift();
    this.playAudio(track);
  }

  /**
   * Detect when participant gets kicked out of the meeting. If the bot gets
   * kicked out, he will end the browsing session.
   *
   * @param event - The Participant kicked event
   */
  private async participantKickedOut(event: IParticipantKickedOut): Promise<void> {
    if (!event.kicked.local) return;
    // Damn, I've got kicked out D:
    await this.page.browser().close(); // ToDo: Consider multiple bots per browser
  }

  private async exposeFunction(fn: ExposableFunction): Promise<void> {
    await this.page.exposeFunction(fn.name, fn.bind(this));
  }
  private async addEventListener(fn: ExposableFunction): Promise<void> {
    await this.page.evaluate(`api.addListener('${fn.name}', ${fn.name})`);
  }
  private async removeEventListener(fn: ExposableFunction, name: string): Promise<void> {
    await this.page.evaluate(`api.removeListener('${fn.name}', ${name})`);
  }
  private async exposeListenerFunction(fn: ExposableFunction): Promise<void> {
    await this.exposeFunction(fn);
    await this.addEventListener(fn);
  }

  async fetchAudio(input: string): Promise<YtResponse> {
    return youtubedl(input, youtubeConf);
  }

  async playAudio(track: YtResponse): Promise<void> {
    const opus = track.formats.filter((format) => format.acodec === 'opus');

    if (!opus.length) {
      throw new Error('Couldn\'t play video due to nonfree codec');
    }
    void this.sendMessage(`:notes: Playing ${track.title}`)
    void this.setAvatarUrl(track.thumbnail);
    try  {
      await this.page.evaluate(`playAudio('${opus[0].url}')`);
    } catch (err) {
      console.error('Failed to play audio', track.url, opus[0], err);
    }
  }

  async sendMessage(msg: string): Promise<void> {
    await this.page.waitForSelector('iframe');
    const elementHandle = await this.page.$('iframe');
    const frame = await elementHandle.contentFrame();
    await frame.type('#usermsg', msg);
    await frame.click('.send-button');
  }

  async sendMessages(msgs: string[]): Promise<void> {
    await this.page.waitForSelector('iframe');
    const elementHandle = await this.page.$('iframe');
    const frame = await elementHandle.contentFrame();
    for (const msg of msgs) {
      await frame.type('#usermsg', msg);
      await this.page.keyboard.down('Shift');
      await this.page.keyboard.press('Enter');
      await this.page.keyboard.up('Shift');
    }
    await frame.click('.send-button');
  }

  async setAvatarUrl(url: string): Promise<void> {
    await this.page.evaluate(`api.executeCommand('avatarUrl', '${url}')`);
  }
}
