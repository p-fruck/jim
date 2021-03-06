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
  room: {
    name: readOrFail('ROOM_NAME'),
    password: env.ROOM_PASSWORD,
  },
  bot: {
    headless: (env.BOT_HEADLESS !== 'false'),
    avatarUrl: env.BOT_AVATAR_URL
      || 'https://raw.githubusercontent.com/p-fruck/jim/master/src/assets/logo.svg',
    name: env.BOT_NAME || 'DJ Jim',
  },
  jitsi: {
    domain: env.JITSI_DOMAIN || 'meet.jit.si',
  },
  joke: {
    delay: readInt('JOKE_DELAY') || 2500,
    filter: env.JOKE_FILTER || 'Any',
  },
  log: {
    level: env.LOG_LEVEL || 'info',
  },
  playlist: {
    maxSize: readInt('PLAYLIST_MAX_SIZE') || 100,
  },
  track: {
    stepSize: readInt('TRACK_STEP_SIZE') || 10,
  },
  volume: {
    initialValue: readInt('VOLUME_INITAL_VALUE') || 20,
    stepSize: readInt('VOLUME_STEP_SIZE') || 10,
  },
};
