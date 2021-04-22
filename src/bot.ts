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
      if (event.message.startsWith('!play ')) {
        const cmd = event.message.split(' ');
        if (cmd.length === 2) {
          console.log('Playing ', cmd[1])
          this.playAudio(cmd[1]);
        }
      }
    });
    setTimeout(async () => {
      await this.page.evaluate('api.removeListener("incomingMessage", dummyMessageListener)');
      await this.page.evaluate('api.addListener("incomingMessage", onIncomingMessage)');
    }, 10000); // ToDo: Fix timing problem

    await this.page.exposeFunction('onParticipantKickedOut', async (event: IParticipantKickedOut) => {
      if (!event.kicked.local) return;
      // Damn, I've got kicked out D:
      await this.page.browser().close(); // ToDo: Consider multiple bots per browser
    });
    await this.page.evaluate('api.addListener("participantKickedOut", onParticipantKickedOut)');
  }

  async playAudio(videoUrl: string): Promise<void> {
    console.log('Playing Audio!')
    const { url: audioUrl } = await youtubedl(videoUrl, youtubeConf);
    try  {
      await this.page.evaluate(`playAudio('${audioUrl}')`);
    } catch (err) {
      console.error('Failed to play audio due to ', err)
    }
  }
}
