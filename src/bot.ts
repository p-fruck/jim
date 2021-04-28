import { Browser, Frame, Page } from 'puppeteer-core';
import youtubedl, { YtResponse } from 'youtube-dl-exec';
import Mutex from './mutex';
import config from './config';
import { IIncomingMessage, IParticipantKickedOut } from './models/jitsi.interface';
import CommandService from './command.service';

// eslint-disable-next-line no-unused-vars
type ExposableFunction = (arg0: any) => any;

export default class JitsiBot {
  public cmdService: CommandService;

  private messageMutex = new Mutex();

  public page: Page;

  public queue = <YtResponse[]> [];

  private youtubeConf = {
    dumpJson: true,
    noWarnings: true,
    noCallHome: true,
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
    const gain = config.volume.initialValue;
    await page.evaluate(`joinConference('${roomName}', '${botName}', ${gain})`);

    const bot = new JitsiBot(page);
    bot.cmdService = await CommandService.init(bot);
    return bot;
  }

  /**
   * Wait until bot joined into the meeting. Then unregister the dummy message
   * listener and register the real one. This is used to circumvent unread
   * messages on join.
   */
  private async videoConferenceJoined(): Promise<void> {
    this.setAvatarUrl(config.bot.avatarUrl);
    await this.exposeFunction(this.cmdService.incomingMessage, this.cmdService);
    await this.removeEventListener(this.cmdService.incomingMessage, 'dummyMessageListener');
    await this.addEventListener(this.cmdService.incomingMessage);
    // open chat, so messages can be sent
    await this.page.evaluate('api.executeCommand("toggleChat")');
  }

  /**
   * Called each time the audio element ends its current track.
   * Responsible for adding the next item from the queue.
   */
  async onAudioEnded(): Promise<void> {
    if (!this.queue.length) {
      this.setAvatarUrl(config.bot.avatarUrl);
      return;
    }
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
   * @param that - Optional binding scope, default is this
   */
  private async exposeFunction(fn: ExposableFunction, scope?: any): Promise<void> {
    await this.page.exposeFunction(fn.name, fn.bind(scope || this));
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
  async sendMessage(msg: string, event?: IIncomingMessage): Promise<void> {
    await this.page.waitForSelector('iframe');
    const elementHandle = await this.page.$('iframe');
    const frame = await elementHandle.contentFrame();

    const unlock = await this.messageMutex.acquire();
    await frame.type('#usermsg', msg);
    await this.sendMessageHandleScope(frame, event);
    unlock();
  }

  /**
   * Sends a multiline chat message
   *
   * @param {string[]} msgs - Lines to send
   */
  async sendMessages(msgs: string[], event?: IIncomingMessage): Promise<void> {
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
    await this.sendMessageHandleScope(frame, event);
    unlock();
  }

  private async sendMessageHandleScope(frame: Frame, event?: IIncomingMessage): Promise<void> {
    if (event?.privateMessage) {
      // Attention: Typo in Jitsi api!
      await this.page.evaluate(`api.executeCommand('intiatePrivateChat', '${event.from}')`);
      await frame.click('.send-button');
      await this.page.evaluate('api.executeCommand("cancelPrivateChat")');
    } else {
      await frame.click('.send-button');
      const sendToGroup = await frame.$('#modal-dialog-cancel-button');
      if (sendToGroup) {
        await sendToGroup.click();
      }
    }
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
