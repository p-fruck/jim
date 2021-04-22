import { appendFile } from 'node:fs';
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

export class JitsiBot {
  private constructor(private page: Page) { }

  static async init(browser: Browser, room: string, botName: string): Promise<JitsiBot> {
    const page = await browser.newPage();
    const url = `file://${__dirname}/../index.html`;

    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(`joinConference('${room}', '${botName}')`);

    const bot = new JitsiBot(page);
    await bot.bindFunctions();

    return bot;
  }

  private async bindFunctions(): Promise<void> {
    await this.page.exposeFunction('onIncomingMessage', (event: IIncomingMessage) => {
      console.log(event.message)
    });
    await this.page.evaluate('api.addListener("incomingMessage", onIncomingMessage)');

    await this.page.exposeFunction('onParticipantKickedOut', async (event: IParticipantKickedOut) => {
      if (!event.kicked.local) return;
      // Damn, I've got kicked out D:
      await this.page.browser().close(); // ToDo: Consider multiple bots per browser
    });
    await this.page.evaluate('api.addListener("participantKickedOut", onParticipantKickedOut)');
  }

  async playAudio(videoUrl: string): Promise<void> {
    const { url: audioUrl } = await youtubedl(videoUrl, youtubeConf);
    await this.page.evaluate(`playAudio('${audioUrl}')`);
  }
}
