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
      const tenantPayload = {
        name: 'Lapinoz Pizza',
        address: 'Ahemdabad',
      }
      const response = await request(app).post('/tenant').send(tenantPayload)
      expect(response.statusCode).toBe(201)
    })

    it('should create a tenant in the database', async () => {
      const tenantPayload = {
        name: 'Lapinoz Pizza',
        address: 'Ahemdabad',
      }
      const tenantRepository = connection.getRepository(Tenant)
      const response = await request(app).post('/tenant').send(tenantPayload)
      const tenants = await tenantRepository.find()

      expect(tenants.length).toBe(1)
      expect(tenants[0].name).toEqual(tenantPayload.name)
      expect(tenants[0].address).toEqual(tenantPayload.address)
    })
  })

  describe('Fields are missing', () => {})
})
