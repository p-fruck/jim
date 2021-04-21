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

  static async init(browser: Browser, room: string): Promise<JitsiBot> {
    const page = await browser.newPage();
    const url = `file://${__dirname}/../index.html`;
    await page.goto(url, { waitUntil: 'load' });

    await page.evaluate(`const api = joinConference('${room}')`);

    return new JitsiBot(page);
  }

  async playAudio(videoUrl: string): Promise<void> {
    const { url: audioUrl } = await youtubedl(videoUrl, youtubeConf);
    let document, api; // placeholders so function below keeps working

    await this.page.evaluate(async (url: string) => {
      const audio = document.getElementById("audio");
      audio.setAttribute("src", url);
      await audio.play();

      // current audio device has to be refreshed to recognize stream
      const devices = await api.getAvailableDevices();
      if (devices.audioInput.length) {
        const [{ label, deviceId }] = devices.audioInput;
        api.setAudioInputDevice(label, deviceId);
      }
    }, audioUrl);
  }
}
