import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { User } from '../../src/entity/User'
import request from 'supertest'
import app from '../../src/app'
import createJWKSMock from 'mock-jwks'
import { USER_ROLES } from '../../src/constants'
import {
  TenantCreationRes,
  UserCreationResponse,
  userResponse,
} from '../../src/types'
import { Tenant } from '../../src/entity/Tenant'

describe('PUT /auth/self', () => {
  let connection: DataSource
  let jwks: ReturnType<typeof createJWKSMock>
  let adminAccessToken: string
  let tenant: Tenant | null

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
    const tenantRes = (await request(app)
      .post('/tenant')
      .set('Cookie', `accessToken=${adminAccessToken};`)
      .send(tenantPayload)) as TenantCreationRes

    const tenantRepo = connection.getRepository(Tenant)
    tenant = await tenantRepo.findOne({ where: { id: tenantRes.body.id } })
  })

  afterEach(() => {
    jwks.stop()
  })

  afterAll(async () => {
    await connection.destroy()
  })

  describe('Given all fields', () => {
    it('should return status 200 for successfully deleted user', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
        role: USER_ROLES.MANAGER,
        tenant: tenant!,
      }

      const userRepository = connection.getRepository(User)
      const createUser = await userRepository.save(userData)

      const deleteuserRes = await request(app)
        .delete(`/user/${createUser.id}`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()

      expect(deleteuserRes.statusCode).toBe(200)
    })

    it('should remove user from database', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
        role: USER_ROLES.MANAGER,
        tenant: tenant!,
      }

      const userRepository = connection.getRepository(User)
      const createUser = await userRepository.save(userData)
      const deleteuserRes = await request(app)
        .delete(`/user/${createUser.id}`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()
      const users = await userRepository.find({})
      expect(users).toHaveLength(0)
    })
  })

  describe('Fields are missing', () => {
    it('should return 401 for invalid token ', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
        role: USER_ROLES.MANAGER,
        tenant: tenant!,
      }

      const userRepository = connection.getRepository(User)
      const createUser = await userRepository.save(userData)
      const deleteuserRes = await request(app)
        .delete(`/user/${createUser.id}`)
        .set('Cookie', `accessToken=${13455}`)
        .send()
      expect(deleteuserRes.statusCode).toBe(401)
    })

    it('should return 403 for customer token in the cookie  ', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
        role: USER_ROLES.MANAGER,
        tenant: tenant!,
      }

      const userRepository = connection.getRepository(User)
      const createUser = await userRepository.save(userData)
      const customerToken = jwks.token({ sub: '1', role: USER_ROLES.CUSTOMER })

      const deleteuserRes = await request(app)
        .delete(`/user/${createUser.id}`)
        .set('Cookie', `accessToken=${customerToken}`)
        .send()
      expect(deleteuserRes.statusCode).toBe(403)
    })

    it('should return 404 for  user id is missing', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
        role: USER_ROLES.MANAGER,
        tenant: tenant!,
      }

      const userRepository = connection.getRepository(User)
      const createUser = await userRepository.save(userData)
      const deleteuserRes = await request(app)
        .delete(`/user/`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()
      expect(deleteuserRes.statusCode).toBe(404)
    })

    it('should return 400 for user id not a valid uuid', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
        role: USER_ROLES.MANAGER,
        tenant: tenant!,
      }

      const userRepository = connection.getRepository(User)
      const createUser = await userRepository.save(userData)
      const deleteuserRes = await request(app)
        .delete(`/user/32432432425`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()
      expect(deleteuserRes.statusCode).toBe(400)
    })

    it('should return 400 for user id not found', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
        role: USER_ROLES.MANAGER,
        tenant: tenant!,
      }

      const userRepository = connection.getRepository(User)
      const createUser = await userRepository.save(userData)
      const deleteuserRes = await request(app)
        .delete(`/user/f5cdc798-0021-43c3-af31-9ad7d762ed61`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()
      expect(deleteuserRes.statusCode).toBe(400)
    })
  })
})
