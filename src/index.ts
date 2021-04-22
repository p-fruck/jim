import puppeteer from 'puppeteer-core';
import { JitsiBot } from './bot';
import config from './config';

async function startBrowser(): Promise<void> {
  const { room, bot: { executable, headless, name } } = config;

  const browser = await puppeteer.launch({
    args: [
      '--use-fake-ui-for-media-stream', // disable asking for webcam & video
      '--disable-web-security', // enable playback of cross origin media/ressources
      '--disable-features=IsolateOrigins,site-per-process' // allow to access cross-origin iframe
    ],
    ignoreDefaultArgs: ['--mute-audio'],
    headless,
    executablePath: executable
  });

  const bot = await JitsiBot.init(browser, room, name);
  await bot.playAudio('https://www.youtube.com/watch?v=y2hIBmhR9J4');
}

void startBrowser();
