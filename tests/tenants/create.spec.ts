import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { Tenant } from '../../src/entity/Tenant'
import request from 'supertest'
import app from '../../src/app'

interface Headers {
  ['set-cookie']: string[]
}

describe('POST /tenants', () => {
  let connection: DataSource
  beforeAll(async () => {
    connection = await AppDataSource.initialize()
  })

  beforeEach(async () => {
    await connection.dropDatabase()
    await connection.synchronize()
  })

  afterAll(async () => {
    await connection.destroy()
  })

  describe('Given all fields', () => {
    it('should return status code 201 in response', async () => {
      const response = await request(app).post('/tenant').send()
      expect(response.statusCode).toBe(201)
    })
  })

  describe('Fields are missing', () => {})
})
