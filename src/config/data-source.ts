import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User } from '../entity/User'
import { CONFIG } from './index'

const { DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD } = CONFIG

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  // It must be false in production, Always keep it false
  synchronize: true,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
})
