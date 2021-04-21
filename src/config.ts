import { config as dotenvConfig } from 'dotenv';

const { env, exit } = process;

dotenvConfig();

// default to production environment
env.NODE_ENV = env.NODE_ENV || 'PRODUCTION';

const readOrFail = (name: string) => {
    if (env[name]) return env[name];
    console.error(`Missing variable in .env - ${name}`);
    exit(1);
}

export default {
    room: <string> readOrFail('ROOM'),
}
