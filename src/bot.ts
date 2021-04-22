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

export class JitsiBot {
  private constructor(private page: Page) { }

  static async init(browser: Browser, room: string, botName: string): Promise<JitsiBot> {
    const page = await browser.newPage();
    const url = `file://${__dirname}/../index.html`;

    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(`joinConference('${room}', '${botName}')`);

    return new JitsiBot(page);
  }

  async playAudio(videoUrl: string): Promise<void> {
    const { url: audioUrl } = await youtubedl(videoUrl, youtubeConf);
    await this.page.evaluate(`playAudio('${audioUrl}')`);
  }
}
