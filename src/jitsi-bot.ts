import { Browser, Frame, Page } from 'puppeteer';
import youtubedl, { YtResponse } from 'youtube-dl-exec';
import CommandService from './command.service';
import config from './config';
import Mutex from './mutex';
import { IIncomingMessage, IParticipantKickedOut } from './models/jitsi.interface';
import logger from './logger';

// eslint-disable-next-line no-unused-vars
type ExposableFunction = (arg0: any) => any;

export default class JitsiBot {
  public cmdService: CommandService;

  private messageMutex = new Mutex();

  public page: Page;

  public queue = <YtResponse[]> [];

  public currentTrack: YtResponse | undefined;

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
    this.exposeListenerFunction(this.passwordRequired);
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
  static async init(
    browser: Browser, domain: string, roomName: string, botName: string,
  ): Promise<JitsiBot> {
    const page = await browser.newPage();
    const url = `file://${__dirname}/../index.html`;

    await page.goto(url, { waitUntil: 'load' });
    const gain = config.volume.initialValue;

    logger.info(`joining conference ${roomName}`);
    await page.evaluate(`joinConference('${domain}', '${roomName}', '${botName}', ${gain})`);

    const bot = new JitsiBot(page);
    bot.cmdService = await CommandService.init(bot);
    return bot;
  }

  private async getApiFrame(): Promise<Frame> {
    await this.page.waitForSelector('iframe');
    const elementHandle = await this.page.$('iframe');
    return elementHandle.contentFrame();
  }

  /**
   * Gets called when Jim trys to join a room which requires a password
   */
  private async passwordRequired(): Promise<void> {
    const frame = await this.getApiFrame();

    if (!config.room.password) {
      logger.error('Room requires password, but password was not specified');
      await this.page.browser().close();
    }
    await frame.type('input', config.room.password);
    const passwordButton = await frame.$('#modal-dialog-ok-button');
    await passwordButton.click();
  }

  /**
   * Wait until bot joined into the meeting. Then unregister the dummy message
   * listener and register the real one. This is used to circumvent unread
   * messages on join.
   */
  private async videoConferenceJoined(): Promise<void> {
    const version = <number> await this.page.evaluate('getJitsiVersion()');
    logger.info(`Using lib-jitsi-meet v${version}`);
    if (version < 4900) {
      logger.warn('Attention! You are running on an outdated version of Jitsi! Jim might not work on this instance!');
    }

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
      this.currentTrack = null;
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
    logger.info('Kicked out of the meeting - exiting');
    await this.page.browser().close();
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
    logger.debug(`Playing ${track.title}`);
    if (!track?.formats?.length) {
      this.sendMessage('This video doesn\'t seem to be available :confused:');
      return;
    }

    const opus = track.formats.filter((format) => format.acodec === 'opus');
    if (!opus.length) {
      logger.error(`Couldn't play video due to nonfree codec: ${track.title}`);
    }

    this.sendMessage(`:notes: Playing ${track.title}`);
    this.setAvatarUrl(track.thumbnail);
    this.currentTrack = track;
    try {
      await this.page.evaluate(`playAudio('${opus[0].url}')`);
    } catch (err) {
      await this.sendMessage('Sorry, I wasn\'t able to play this track :confounded_face: Please check your logs and report this bug :bug:');
      logger.error(`Failed to play audio - ${opus[0]},  ${err}`);
    }
  }

  /**
   * Sends a chat message
   *
   * @param {string} msg - The message to send
   * @param {IIncomingMessage} event - Optional messaging event
   */
  async sendMessage(msg: string, event?: IIncomingMessage): Promise<void> {
    const frame = await this.getApiFrame();
    const unlock = await this.messageMutex.acquire();
    const b64 = Buffer.from(msg).toString('base64');
    await this.page.evaluate(`setMessage('${b64}')`);
    // work around missing messaging capabilities in jitsi API
    await frame.type('#usermsg', ' ');
    await this.sendMessageHandleScope(frame, event);
    unlock();
  }

  /**
   * Sends a multiline chat message
   *
   * @param {string[]} msgs - The lines to send, each item represents one line
   * @param {IIncomingMessage} event - Optional messaging event
   */
  async sendMultilineMessage(msgs: string[], event?: IIncomingMessage): Promise<void> {
    return this.sendMessage(msgs.join('\n'), event);
  }

  /**
   * Handle the scope of the message to be sent (private or group message)
   *
   * @param frame - The jitsi IFrame instance
   * @param event - Optional messaging event
   */
  private async sendMessageHandleScope(frame: Frame, event?: IIncomingMessage): Promise<void> {
    if (event?.privateMessage) {
      await this.page.evaluate(`api.executeCommand('initiatePrivateChat', '${event.from}')`);
      await this.page.keyboard.press('Enter');
      await this.page.evaluate('api.executeCommand("cancelPrivateChat")');
    } else {
      await this.page.keyboard.press('Enter');
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
