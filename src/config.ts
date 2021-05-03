import { config as dotenvConfig } from 'dotenv';

const { env } = process;

dotenvConfig();

// default to production environment
env.NODE_ENV = env.NODE_ENV || 'PRODUCTION';

const readInt = (name: string) => parseInt(env[name], 10);

const readOrFail = (name: string) => {
  if (env[name]) return env[name];
  throw new Error(`Missing variable in .env - ${name}`);
};

export default {
  room: <string>readOrFail('ROOM'),
  bot: {
    headless: <boolean>(env.BOT_HEADLESS !== 'false'),
    avatarUrl: <string>env.BOT_AVATAR_URL
      || 'https://raw.githubusercontent.com/p-fruck/jim/master/src/assets/logo.svg',
    name: <string>env.BOT_NAME || 'DJ Jim',
  },
  joke: {
    delay: <number>readInt('JOKE_DELAY') || 2500,
    filter: <string>env.JOKE_FILTER || 'Any',
  },
  playlist: {
    maxSize: <number>readInt('PLAYLIST_MAX_SIZE') || 100,
  },
  track: {
    stepSize: <number>readInt('TRACK_STEP_SIZE') || 10,
  },
  volume: {
    initialValue: <number>readInt('VOLUME_INITAL_VALUE') || 20,
    stepSize: <number>readInt('VOLUME_STEP_SIZE') || 10,
  },
};
