import { config } from 'dotenv'
config()

const { PORT, NODE_ENV, SHUTDOWN_WINDOW_TIMEFRAME } = process.env

export const CONFIG = {
  PORT,
  NODE_ENV,
  SHUTDOWN_WINDOW_TIMEFRAME,
}
