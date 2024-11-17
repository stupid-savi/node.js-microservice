import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User } from '../entity/User'
import { CONFIG } from './index'

const { DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD, NODE_ENV } = CONFIG

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  // It must be false in production
  synchronize: NODE_ENV === 'dev' || NODE_ENV === 'test',
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
})
