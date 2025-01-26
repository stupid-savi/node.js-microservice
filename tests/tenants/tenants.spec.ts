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

    it('should return searched Tenant', async () => {
      const tenantPayload = {
        name: 'Lapinoz Pizza',
        address: 'Ahemdabad',
      }
      await request(app)
        .post('/tenant')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(tenantPayload)
      const response = (await request(app)
        .get('/tenant/tenant-list?searchQuery=Lapinoz')
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()) as TenantListResponse

      expect(response.body.data.tenants[0].name).toEqual(tenantPayload.name)
      expect(response.body.data.tenants[0].address).toEqual(
        tenantPayload.address,
      )
    })

    it('should return  status 200', async () => {
      const tenantPayload = {
        name: 'Lapinoz Pizza',
        address: 'Ahemdabad',
      }

      const tenant = await request(app)
        .post('/tenant')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(tenantPayload)

      const response = (await request(app)
        .get(`/tenant/${tenant.body.id}`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()) as TenantResponse

      console.log(response.body)

      expect(response.statusCode).toBe(200)
      expect(response.body.data.id).toEqual(tenant.body.id)
    })

    it('should return created tenant id', async () => {
      const tenantPayload = {
        name: 'Lapinoz Pizza',
        address: 'Ahemdabad',
      }

      const tenant = await request(app)
        .post('/tenant')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(tenantPayload)

      const response = (await request(app)
        .get(`/tenant/${tenant.body.id}`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()) as TenantResponse
      expect(response.body.data.id).toEqual(tenant.body.id)
    })
  })

  describe('Given Fields are missing', () => {
    it('Should return empty tenant list for page count not available', async () => {
      const tenantPayload = {
        name: 'Lapinoz Pizza',
        address: 'Ahemdabad',
      }
      await request(app)
        .post('/tenant')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(tenantPayload)
      const response = (await request(app)
        .get('/tenant/tenant-list?page=2')
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()) as TenantListResponse

      expect(response.body.data.tenants).toHaveLength(0)
    })
    it('Should return empty tenant list for Searched tenant is not available', async () => {
      const tenantPayload = {
        name: 'Lapinoz Pizza',
        address: 'Ahemdabad',
      }
      await request(app)
        .post('/tenant')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(tenantPayload)
      const response = (await request(app)
        .get('/tenant/tenant-list?searchQuery=Dominoz')
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()) as TenantListResponse

      expect(response.body.data.tenants).toHaveLength(0)
    })
    it('Should return 500 status code for tenant not be uuid', async () => {
      const response = (await request(app)
        .get(`/tenant/kdjksajd34324jkj432k4`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()) as TenantResponse

      expect(response.statusCode).toBe(500)
    })
    it('Should return 400 status code for tenant id not found', async () => {
      const response = (await request(app)
        .get(`/tenant/bb997202-ce5f-4c20-a760-684a8a9b5913`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()) as TenantResponse

      expect(response.statusCode).toBe(400)
    })
  })
})
