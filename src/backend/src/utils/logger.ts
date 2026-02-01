import pino from 'pino';

const environment = process.env.NODE_ENV || 'development';
const isDevelopment = environment === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          levelFirst: true,
          singleLine: false,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  serializers: {
    error: pino.stdSerializers.error,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  base: {
    environment,
    service: 'clinical-api',
  },
});
