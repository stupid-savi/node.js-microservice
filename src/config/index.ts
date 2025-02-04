import { config } from 'dotenv'
import path from 'path'

config({ path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`) })

const {
  PORT,
  NODE_ENV,
  SHUTDOWN_WINDOW_TIMEFRAME,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USERNAME,
  DB_PASSWORD,
  REFRESH_TOKEN_SECRET,
  JWKS_URI,
  PRIVATE_KEY,
} = process.env

export const CONFIG = {
  PORT,
  NODE_ENV,
  SHUTDOWN_WINDOW_TIMEFRAME,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USERNAME,
  DB_PASSWORD,
  REFRESH_TOKEN_SECRET,
  JWKS_URI,
  PRIVATE_KEY,
}
