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
    executable: <string>readOrFail('BOT_EXECUTABLE'),
    headless: <boolean>(env.BOT_HEADLESS === 'true'),
    avatarUrl: <string> env.BOT_AVATAR_URL
      || 'https://raw.githubusercontent.com/p-fruck/jim/master/src/assets/logo.svg',
    name: <string>env.BOT_NAME || 'DJ Jim',
  },
  playlist: {
    maxSize: <number>readInt('PLAYLIST_MAX_SIZE') || 100,
  },
  volume: {
    initialValue: <number>readInt('VOLUME_INITAL_VALUE') || 20,
    stepSize: <number>readInt('VOLUME_STEP_SIZE') || 10,
  },
};
