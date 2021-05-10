import puppeteer from 'puppeteer';
import JitsiBot from './jitsi-bot';
import config from './config';

async function startBrowser(): Promise<void> {
  const { room, bot: { headless, name: botName }, jitsi: { domain } } = config;

  const browser = await puppeteer.launch({
    args: [
      '--use-fake-ui-for-media-stream', // disable asking for webcam & video
      '--use-fake-device-for-media-stream', // use fake microphone
      '--disable-web-security', // enable playback of cross origin media/ressources
      '--disable-features=IsolateOrigins,site-per-process', // allow to access cross-origin iframe
      // performance related
      '--disable-accelerated-2d-canvas',
      '--single-process',
      '--disable-gpu',
    ],
    headless,
  });

  await JitsiBot.init(browser, domain, room.name, botName);
}

startBrowser();
