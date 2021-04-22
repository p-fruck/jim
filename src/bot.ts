import { Browser, Page } from 'puppeteer-core';
import youtubedl from 'youtube-dl-exec';

const youtubeConf = {
  dumpJson: true,
  noWarnings: true,
  noCallHome: true,
  extractAudio: true,
  noCheckCertificate: true,
  preferFreeFormats: true,
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
  private constructor(private page: Page) {
    void this.exposeListenerFunction(this.participantKickedOut);
    void this.exposeListenerFunction(this.videoConferenceJoined);
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
    setTimeout(async () => {
      await this.exposeFunction(this.incomingMessage);
      await this.removeEventListener(this.incomingMessage, 'dummyMessageListener');
      await this.addEventListener(this.incomingMessage);
    }, 10000); // ToDo: Fix timing problem
  }

  /**
   * Listen to incoming chat messages. Used to detect bot commands.
   *
   * @param event - The message event
   */
  private async incomingMessage(event: IIncomingMessage): Promise<void> {
    if (event.message.startsWith('!play ')) {
      const cmd = event.message.split(' ');
      if (cmd.length === 2) {
        await this.playAudio(cmd[1]);
      }
    }
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

  async playAudio(videoUrl: string): Promise<void> {
    console.log('Playing Audio!')
    const { url: audioUrl } = await youtubedl(videoUrl, youtubeConf);
    try  {
      await this.page.evaluate(`playAudio('${audioUrl}')`);
    } catch (err) {
      // Some links cannot be played back --> Issue with media codec?
      console.error('Failed to play audio', videoUrl, audioUrl, err)
    }
  }
}
