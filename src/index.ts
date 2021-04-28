import puppeteer from 'puppeteer';
import JitsiBot from './bot';
import config from './config';

async function startBrowser(): Promise<void> {
  const { room, bot: { headless, name } } = config;

  const browser = await puppeteer.launch({
    args: [
      '--use-fake-ui-for-media-stream', // disable asking for webcam & video
      '--use-fake-device-for-media-stream', // use fake microphone
      '--disable-web-security', // enable playback of cross origin media/ressources
      '--disable-features=IsolateOrigins,site-per-process', // allow to access cross-origin iframe
    ],
    headless,
  });

  await JitsiBot.init(browser, room, name);
}

startBrowser();
