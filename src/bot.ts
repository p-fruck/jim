import { Browser, Page } from 'puppeteer-core';
import youtubedl, { YtResponse } from 'youtube-dl-exec';
import Mutex from './mutex';
import config from './config';
import { IIncomingMessage, IParticipantKickedOut } from './models/jitsi.interface';

// eslint-disable-next-line no-unused-vars
type ExposableFunction = (arg0: any) => any;

export default class JitsiBot {
  private messageMutex = new Mutex();

  private page: Page;

  private queue = <YtResponse[]> [];

  private youtubeConf = {
    dumpJson: true,
    noWarnings: true,
    noCallHome: true,
    extractAudio: true,
    audioFormat: 'vorbis',
    noCheckCertificate: true,
    preferFreeFormats: true,
    defaultSearch: 'ytsearch',
    youtubeSkipDashManifest: true,
  };

  private constructor(page: Page) {
    this.page = page;
    this.exposeListenerFunction(this.participantKickedOut);
    this.exposeListenerFunction(this.videoConferenceJoined);
    this.exposeListenerFunction(this.onAudioEnded);
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
    const gain = config.volume.initialValue / 100;
    await page.evaluate(`joinConference('${roomName}', '${botName}', ${gain})`);

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
            this.sendMessage(`Sorry, I cannot remember more than ${config.playlist.maxSize} tracks :confounded_face:`);
          }
          const track = await this.fetchAudio(params.join(' '));
          this.queue.push(track);
          if (await this.page.evaluate('audio.ended || audio.currentTime === 0')) {
            await this.onAudioEnded();
          }
        }
        break;
      case '!clear':
        this.queue = [];
        break;
      case '!help':
        this.sendMessages([
          '!add <url|searchTerm> - Add track to queue',
          '!clear - Clear the queue',
          '!help - Print the help menu',
          '!list - Show tracks in queue',
          '!ping - Ping me!',
          '!play <url|searchTerm> - Play track now, or resume if no params were given',
          '!skip - Skip current track and play next',
          '!vol - Retrieve current volume level',
          '!vol <+|-|[0-100]> - increment/decrement/set volume level',
        ]);
        break;
      case '!list':
        this.sendMessages(this.queue.map((track) => track.title));
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
      case '!skip':
        if (this.queue.length) {
          this.onAudioEnded();
        } else {
          this.page.evaluate('audio.src = ""');
        }
        break;
      case '!vol': {
        let gain = <number> await this.page.evaluate('getGain()');
        if (params.length === 0) {
          this.sendMessage(`Current volume level equals ${gain}%`);
        } else {
          const { stepSize } = config.volume;
          switch (true) {
            case /^(0|100|[1-9][0-9]?)$/.test(params[0]):
              gain = parseInt(params[0], 10);
              break;
            case /^\++$/.test(params[0]):
              gain += params[0].length * stepSize;
              break;
            case /^-+$/.test(params[0]):
              gain -= params[0].length * stepSize;
              break;
            default:
              this.sendMessage(
                'I did not understand that. Please use !vol to retrieve some '
                + 'volume information, !vol [0-100] to set the volume level '
                + 'directly or !vol (+|-), where each plus or minus increments/'
                + `decrements the total gain by ${stepSize}`,
              );
              return;
          }
          this.page.evaluate(`setGain(${gain})`);
        }
        break;
      }
      default:
        if (cmd.startsWith('!')) {
          this.sendMessage('Are you talking to me? :thinking: Try !help :bulb:');
        }
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

  /**
   * Expose a function to the frontend
   *
   * @param fn - The function to expose
   */
  private async exposeFunction(fn: ExposableFunction): Promise<void> {
    await this.page.exposeFunction(fn.name, fn.bind(this));
  }

  /**
   * Add event listener to the jitsi api.
   *
   * @param fn - The function to add the listener to
   */
  private async addEventListener(fn: ExposableFunction): Promise<void> {
    await this.page.evaluate(`api.addListener('${fn.name}', ${fn.name})`);
  }

  /**
   * Remove event listener from jitsi api
   *
   * @param fn - The function that has the listener registered
   * @param name - The name of the listening function to remove
   */
  private async removeEventListener(fn: ExposableFunction, name: string): Promise<void> {
    await this.page.evaluate(`api.removeListener('${fn.name}', ${name})`);
  }

  /**
   * Shortcut to expose a function and add an event listener
   *
   * @param fn - The function to expose
   */
  private async exposeListenerFunction(fn: ExposableFunction): Promise<void> {
    await this.exposeFunction(fn);
    await this.addEventListener(fn);
  }

  /**
   * Convert a video url or a youtube search term to an Object
   * containing information about the corresponding youtube video
   *
   * @param {string} input - The video url or youtube search term
   * @returns {Promise<YtResponse>} - Information about the corresponding video
   */
  async fetchAudio(input: string): Promise<YtResponse> {
    return youtubedl(input, this.youtubeConf);
  }

  /**
   * Start playback of a given track
   *
   * @param {YtResponse} track - The track to play
   */
  async playAudio(track: YtResponse): Promise<void> {
    const opus = track.formats.filter((format) => format.acodec === 'opus');

    if (!opus.length) {
      throw new Error('Couldn\'t play video due to nonfree codec');
    }
    this.sendMessage(`:notes: Playing ${track.title}`);
    this.setAvatarUrl(track.thumbnail);
    try {
      await this.page.evaluate(`playAudio('${opus[0].url}')`);
    } catch (err) {
      throw new Error(`Failed to play audio - ${track.url},  ${err}`);
    }
  }

  /**
   * Sends a chat message
   *
   * @param {string} msg - The message to send
   */
  async sendMessage(msg: string): Promise<void> {
    await this.page.waitForSelector('iframe');
    const elementHandle = await this.page.$('iframe');
    const frame = await elementHandle.contentFrame();

    const unlock = await this.messageMutex.acquire();
    await frame.type('#usermsg', msg);
    await frame.click('.send-button');
    unlock();
  }

  /**
   * Sends a multiline chat message
   *
   * @param {string[]} msgs - Lines to send
   */
  async sendMessages(msgs: string[]): Promise<void> {
    await this.page.waitForSelector('iframe');
    const elementHandle = await this.page.$('iframe');
    const frame = await elementHandle.contentFrame();

    const unlock = await this.messageMutex.acquire();
    // eslint-disable-next-line no-restricted-syntax
    for (const msg of msgs) {
      /* eslint-disable no-await-in-loop */
      await frame.type('#usermsg', msg);
      await this.page.keyboard.down('Shift');
      await this.page.keyboard.press('Enter');
      await this.page.keyboard.up('Shift');
      /* eslint-enable no-await-in-loop */
    }
    await frame.click('.send-button');
    unlock();
  }

  /**
   * Set avatar picture to a given image
   *
   * @param {string} url - Url to the image
   */
  async setAvatarUrl(url: string): Promise<void> {
    await this.page.evaluate(`api.executeCommand('avatarUrl', '${url}')`);
  }
}
