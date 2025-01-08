import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { Tenant } from '../../src/entity/Tenant'
import request from 'supertest'
import app from '../../src/app'
import createJWKSMock from 'mock-jwks'
import { USER_ROLES } from '../../src/constants'

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
    console.log('jwks', jwks)
    it('should return status code 201 in response', async () => {
      const tenantPayload = {
        name: 'Lapinoz Pizza',
        address: 'Ahemdabad',
      }
      const response = await request(app)
        .post('/tenant')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(tenantPayload)
      expect(response.statusCode).toBe(201)
    })

    it('should create a tenant in the database', async () => {
      const tenantPayload = {
        name: 'Lapinoz Pizza',
        address: 'Ahemdabad',
      }
      const tenantRepository = connection.getRepository(Tenant)
      const response = await request(app)
        .post('/tenant')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(tenantPayload)
      const tenants = await tenantRepository.find()

      expect(tenants.length).toBe(1)
      expect(tenants[0].name).toEqual(tenantPayload.name)
      expect(tenants[0].address).toEqual(tenantPayload.address)
    })
  })

  describe('Fields are missing', () => {
    it('should return status code 400 if tenant name is not available in request payload', async () => {
      const tenantPayload = {
        address: 'Ahemdabad',
      }
      const response = await request(app)
        .post('/tenant')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(tenantPayload)
      expect(response.statusCode).toBe(400)
    })

    it('should return status code 400 if tenant address is not available in request payload', async () => {
      const tenantPayload = {
        name: 'Lapinoz Pizza',
      }
      const response = await request(app)
        .post('/tenant')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(tenantPayload)
      expect(response.statusCode).toBe(400)
    })

    it('should return status code 400 if tenant address or tenant name is not available in request payload', async () => {
      const tenantPayload = {}
      const response = await request(app)
        .post('/tenant')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(tenantPayload)
      expect(response.statusCode).toBe(400)
    })

    it('should return status code 400 if tenant address or tenant name is not available in request payload', async () => {
      const tenantPayload = {}
      const response = await request(app)
        .post('/tenant')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(tenantPayload)
      expect(response.statusCode).toBe(400)
    })

    it('should return status code 400 if tenant address is not a string', async () => {
      const tenantPayload = {
        address: 12345,
      }
      const response = await request(app)
        .post('/tenant')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(tenantPayload)
      expect(response.statusCode).toBe(400)
    })

    it('should return status code 400 if tenant name is not a string', async () => {
      const tenantPayload = {
        name: 12345,
      }
      const response = await request(app)
        .post('/tenant')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(tenantPayload)
      expect(response.statusCode).toBe(400)
    })

    it('should return 401 is user is not authenticated', async () => {
      const tenantPayload = {
        name: 'Lapinoz Pizza',
        address: 'Ahemdabad',
      }

      const tenantRepository = connection.getRepository(Tenant)
      const response = await request(app).post('/tenant').send(tenantPayload)
      const tenants = await tenantRepository.find()
      expect(response.statusCode).toBe(401)
      expect(tenants.length).toBe(0)
    })

    it('should return 403 is user is not admin user', async () => {
      const tenantPayload = {
        name: 'Lapinoz Pizza',
        address: 'Ahemdabad',
      }

      const managerToken = jwks.token({ sub: '1', role: USER_ROLES.MANAGER })
      const tenantRepository = connection.getRepository(Tenant)
      const response = await request(app)
        .post('/tenant')
        .set('Cookie', `accessToken=${managerToken};`)
        .send(tenantPayload)
      const tenants = await tenantRepository.find()
      expect(response.statusCode).toBe(403)
      expect(tenants.length).toBe(0)
    })
  })
})
