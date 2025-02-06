import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { CONFIG } from './index'

const { DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD } = CONFIG

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  ssl: CONFIG.NODE_ENV === 'test',
  // It must be false in production, Always keep it false
  synchronize: true,
  logging: false,
  entities: [
    CONFIG.NODE_ENV === 'prod'
      ? 'dist/src/entity/*.{ts,js}'
      : 'src/entity/*.{ts,js}',
  ],
  migrations: [
    CONFIG.NODE_ENV === 'prod'
      ? 'dist/src/migration/*.{ts,js}'
      : 'src/migration/*.{ts,js}',
  ],
  subscribers: [],
})
