import https from 'https';
import JitsiBot from '../jitsi-bot';
import { IJimCommand } from '../command.service';
import config from '../config';
import { IIncomingMessage } from '../models/jitsi.interface';
import logger from '../logger';

interface IJoke {
  error: boolean,
  category: string,
  type: 'single' | 'twopart',
  joke?: string
  setup?: string,
  delivery?: string,
  flags: {
    nsfw: boolean,
    religious: boolean,
    political: boolean,
    racist: boolean,
    sexist: boolean,
    explicit: boolean
  },
  safe: boolean,
  id: number,
  lang: string,
}

const options = {
  hostname: 'v2.jokeapi.dev',
  port: 443,
  path: `/joke/${config.joke.filter}`,
  method: 'GET',
};

export default <IJimCommand>{
  execute: async (jim: JitsiBot, params: string[], event: IIncomingMessage) => {
    const req = https.request(options, (res) => {
      res.on('data', async (data: string) => {
        const joke: IJoke = JSON.parse(data);
        if (joke.type === 'single') {
          await jim.sendMessage(joke.joke, event);
        } else {
          await jim.sendMessage(joke.setup, event);
          setTimeout(() => jim.sendMessage(joke.delivery, event), config.joke.delay);
        }
      });
    });

    req.on('error', async (err) => {
      logger.error(`Error fetching joke API: ${err}`);
      await jim.sendMultilineMessage([
        'Knock knock',
        'Who\'s there?',
        'An error! Check your Logs!',
      ], event);
    });

    req.end();
  },
  description: 'Try to make you laugh :laughing:',
};
