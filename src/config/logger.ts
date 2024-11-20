import winston from 'winston'
import { CONFIG } from './index'

const format = winston.format.combine(
  winston.format.json(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.prettyPrint(),
)

const logger = winston.createLogger({
  level: 'info',
  defaultMeta: {
    serviceName: 'auth-service',
  },

  transports: [
    new winston.transports.File({
      level: 'error',
      dirname: './logs',
      filename: 'error.log',
      format,
      silent: ['test'].includes(CONFIG.NODE_ENV || ''),
    }),
    new winston.transports.File({
      level: 'info',
      dirname: './logs',
      filename: 'info.log',
      format,
      silent: ['test'].includes(CONFIG.NODE_ENV || ''),
    }),
    new winston.transports.File({
      level: 'warn',
      dirname: './logs',
      filename: 'warn.log',
      format,
      silent: ['test'].includes(CONFIG.NODE_ENV || ''),
    }),
    new winston.transports.Console({
      level: 'info',
      silent: CONFIG.NODE_ENV === 'production',
    }),
  ],
})

export default logger
