import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import createJWKSMock from 'mock-jwks'
import { USER_ROLES } from '../../src/constants'
import request from 'supertest'
import app from '../../src/app'
import { TenantListResponse, TenantResponse } from '../../src/types'

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
    it('should return status code 200 if tenant deleted successfully', async () => {
      const tenantPayload = {
        name: 'Lapinoz Pizza',
        address: 'Ahemdabad',
      }
      const tenant = await request(app)
        .post('/tenant')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(tenantPayload)
      const response = await request(app)
        .delete(`/tenant/${tenant.body.id}`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()
      expect(response.statusCode).toBe(200)
    })

    it('should return  empty tenant list', async () => {
      const tenantPayload = {
        name: 'Lapinoz Pizza',
        address: 'Ahemdabad',
      }
      const tenant = await request(app)
        .post('/tenant')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(tenantPayload)
      await request(app)
        .delete(`/tenant/${tenant.body.id}`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()

      const response = (await request(app)
        .get('/tenant/tenant-list')
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()) as TenantListResponse
      expect(response.body.data.tenants).toHaveLength(0)
    })

    it('should return status code 500 for invalid uuid', async () => {
      const response = await request(app)
        .delete(`/tenant/94328493824982934jdsdjfkjskfs`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()

      expect(response.statusCode).toBe(500)
    })

    it('should return status code 400 for tenant id not found', async () => {
      const response = await request(app)
        .delete(`/tenant/bb997202-ce5f-4c20-a760-684a8a9b5913`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()

      expect(response.statusCode).toBe(400)
    })
  })
})
