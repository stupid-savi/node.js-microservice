import app from './app'
import { CONFIG } from './config'
import { Server } from 'http'
import logger from './config/logger'
import { AppDataSource } from './config/data-source'
let server: Server | null = null
export let HEALTH_CHECK_ENABLED = true
let timerId: NodeJS.Timeout | null
const gracefulShutdownTime = parseInt(CONFIG.SHUTDOWN_WINDOW_TIMEFRAME || '15')

const startServer = () => {
  try {
    server = app.listen(CONFIG.PORT, () => {
      logger.info('Server is listening at PORT', { port: CONFIG.PORT })
    })
  } catch (err) {
    console.error(err)
    server = null
  }
}

// AppDataSource.initialize()
//   .then(() => {
//     console.log('Data Source has been initialized!')
//   })
//   .catch((err) => {
//     console.error('Error during Data Source initialization', err)
//   })

const shutdownGracefully = function (signal: NodeJS.Signals) {
  console.log(`Caught ${signal}, shutting down gracefully`)
  HEALTH_CHECK_ENABLED = false

  timerId = setTimeout(() => {
    if (server) {
      server.close((error?: Error) => {
        if (error) {
          console.log('Error closing the server', error)
          process.exit(1)
        }
        console.log('Server closed successfully')
        process.exit(0)
      })
    }
  }, gracefulShutdownTime * 1000)
}

const clearTimeoutEvent = () => {
  if (timerId) {
    console.log('removing timer event before exiting the program')
    clearTimeout(timerId)
    console.log('program exited successfully')
  }
}

if (require.main === module) {
  startServer()
}

process.on('SIGINT', shutdownGracefully)
process.on('SIGTERM', shutdownGracefully)
process.on('exit', clearTimeoutEvent)
