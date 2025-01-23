import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import createJWKSMock from 'mock-jwks'
import { USER_ROLES } from '../../src/constants'
import request from 'supertest'
import app from '../../src/app'
import { TenantResponse } from '../../src/types'

describe('POST /tenants', () => {
  let connection: DataSource
  let jwks: ReturnType<typeof createJWKSMock>
  let adminAccessToken: string

  beforeAll(async () => {
    jwks = createJWKSMock('http://localhost:8085')
    connection = await AppDataSource.initialize()
  })

  beforeEach(async () => {
    await connection.dropDatabase()
    await connection.synchronize()
    jwks.start()
    adminAccessToken = jwks.token({ sub: '1', role: USER_ROLES.ADMIN })
  })

  afterEach(() => {
    jwks.stop()
  })

  afterAll(async () => {
    await connection.destroy()
  })

  describe('Given all fields', () => {
    it('should return status code 200 for tenant list', async () => {
      const tenantPayload = {
        name: 'Lapinoz Pizza',
        address: 'Ahemdabad',
      }
      await request(app)
        .post('/tenant')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(tenantPayload)
      const response = await request(app)
        .get('/tenant/tenant-list')
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()
      expect(response.statusCode).toBe(200)
      console.log(response.body)
      expect(response.body.data).toHaveProperty('tenants')
      expect(response.body.data.tenants).toHaveLength(1)
      expect(response.body.data.total).toBe(1)
    })

    it('should return  status 200 and tenant info', async () => {
      const tenantPayload = {
        name: 'Lapinoz Pizza',
        address: 'Ahemdabad',
      }
      const tenant = await request(app)
        .post('/tenant')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(tenantPayload)

      console.log('tenant', tenant.body)

      const response = await request(app)
        .get(`/tenant/${tenant.body.id}}`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()

      expect(response.statusCode).toBe(200)
    })
  })

  describe('Fields are missing', () => {})
})
