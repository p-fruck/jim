import { createLogger, format, transports } from 'winston';
import config from './config';

const logger = createLogger({
  level: config.log.level,
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format((info) => ({
      ...info,
      level: info.level.toUpperCase(),
    }))(),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
    format.colorize(),
    format.printf((info) => `[${info.timestamp}] [${info.service}] [${info.level}]: ${info.message}`),
  ),
  defaultMeta: { service: 'backend' },
  transports: [
    new transports.Console(),
  ],
});

export default logger;
