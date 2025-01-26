import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import createJWKSMock from 'mock-jwks'
import { USER_ROLES } from '../../src/constants'
import request from 'supertest'
import { Response } from 'supertest'
import app from '../../src/app'
import { TenantListResponse, TenantResponse } from '../../src/types'

describe('POST /tenants', () => {
  let connection: DataSource
  let jwks: ReturnType<typeof createJWKSMock>
  let adminAccessToken: string
  let createdTenant: Response

  beforeAll(async () => {
    jwks = createJWKSMock('http://localhost:8085')
    connection = await AppDataSource.initialize()
  })

  beforeEach(async () => {
    await connection.dropDatabase()
    await connection.synchronize()
    jwks.start()
    adminAccessToken = jwks.token({ sub: '1', role: USER_ROLES.ADMIN })
    const tenantPayload = {
      name: 'Lapinoz Pizza',
      address: 'Ahemdabad',
    }
    createdTenant = await request(app)
      .post('/tenant')
      .set('Cookie', `accessToken=${adminAccessToken};`)
      .send(tenantPayload)
  })

  afterEach(() => {
    jwks.stop()
  })

  afterAll(async () => {
    await connection.destroy()
  })

  describe('Given all fields', () => {
    it('Should return status code 200 for successful tenant update', async () => {
      const modifiedPayload = {
        name: 'Lapinoz Pizza00',
        address: 'Ahemdabad00',
      }
      const response = await request(app)
        .put(`/tenant/${createdTenant.body.id}`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send(modifiedPayload)

      expect(response.statusCode).toBe(200)
    })

    it('Should return updated name and address of the tenant', async () => {
      const modifiedPayload = {
        name: 'Martinoz Pizza',
        address: 'Surat',
      }
      await request(app)
        .put(`/tenant/${createdTenant.body.id}`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send(modifiedPayload)

      const response = (await request(app)
        .get('/tenant/tenant-list')
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()) as TenantListResponse

      expect(response.body.data.tenants[0].name).toEqual(modifiedPayload.name)
      expect(response.body.data.tenants[0].address).toEqual(
        modifiedPayload.address,
      )
    })
  })

  describe('Fields are missing', () => {
    it('Should return status code 400 invalid tenant name', async () => {
      const modifiedPayload = {
        name: 999,
        address: 'Ahemdabad',
      }
      const response = await request(app)
        .put(`/tenant/${createdTenant.body.id}`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send(modifiedPayload)

      expect(response.statusCode).toBe(400)
    })
    it('Should return status code 400 invalid tenant address', async () => {
      const modifiedPayload = {
        name: 'Lapinox',
        address: '',
      }
      const response = await request(app)
        .put(`/tenant/${createdTenant.body.id}`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send(modifiedPayload)

      expect(response.statusCode).toBe(400)
    })
    it('Should return status code 500 invalid tenant id', async () => {
      const modifiedPayload = {
        name: 999,
        address: 'Ahemdabad',
      }
      const response = await request(app)
        .put(`/tenant/jsdksjad88d9sa89d`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send(modifiedPayload)

      expect(response.statusCode).toBe(400)
    })
    it('Should return status code 400 tenant id not found ', async () => {
      const modifiedPayload = {
        name: 999,
        address: 'Ahemdabad',
      }
      const response = await request(app)
        .put(`/tenant/e1a9a3b5-44e2-40c5-9f29-652198f951f7`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send(modifiedPayload)

      expect(response.statusCode).toBe(400)
    })
  })
})
