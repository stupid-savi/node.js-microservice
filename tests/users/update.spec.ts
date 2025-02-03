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
    it('should return status code 200 for a successful update for a user', async () => {
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
      console.log('create user>>>>>>>>>>>>>', createUser)
      const upadtedUserData = {
        firstname: 'Riya',
        lastname: 'Tiwari',
        role: USER_ROLES.MANAGER,
        tenantId: createUser.tenant.id,
      }
      const response = await request(app)
        .put(`/user/${createUser.id}`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send(upadtedUserData)

      expect(response.statusCode).toBe(200)
    })

    it('should return status code 200 if tenant id is missing in payload', async () => {
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
      const upadtedUserData = {
        firstname: 'Savi2',
        lastname: 'Parihar',
        role: USER_ROLES.MANAGER,
      }

      const response = await request(app)
        .put(`/user/${createUser.id}`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send(upadtedUserData)
      expect(response.statusCode).toBe(200)
    })

    it('should perist the updated user in the database', async () => {
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
      const upadtedUserData = {
        firstname: 'Riya',
        lastname: 'Tiwari',
        role: USER_ROLES.ADMIN,
        tenantId: createUser.tenant.id,
      }

      await request(app)
        .put(`/user/${createUser.id}`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send(upadtedUserData)

      const findUser = await userRepository.findOne({
        where: { email: userData.email },
      })
      expect(findUser?.firstname).toEqual(upadtedUserData.firstname)
      expect(findUser?.lastname).toEqual(upadtedUserData.lastname)
      expect(findUser?.role).toEqual(upadtedUserData.role)
    })

    it('should perist the updated tenant in the database', async () => {
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
      const tenantPayload2 = {
        name: 'Dominoz Pizza',
        address: 'Gujrat',
      }
      const tenantRes = (await request(app)
        .post('/tenant')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(tenantPayload2)) as TenantCreationRes

      const upadtedUserData = {
        firstname: 'Riya',
        lastname: 'Tiwari',
        role: USER_ROLES.ADMIN,
        tenantId: tenantRes.body.id,
      }
      await request(app)
        .put(`/user/${createUser.id}`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send(upadtedUserData)

      const findUpdatedUser = await userRepository.findOne({
        relations: ['tenant'],
        where: { email: userData.email },
      })
      console.log('145', findUpdatedUser)
      expect(findUpdatedUser?.tenant.id).toEqual(tenantRes.body.id)
      expect(findUpdatedUser?.tenant.address).toEqual(tenantPayload2.address)
      expect(findUpdatedUser?.tenant.name).toEqual(tenantPayload2.name)
    })
  })

  describe('Fields are missing', () => {
    it('should return status code 400 if firstname is missing in payload', async () => {
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
      const upadtedUserData = {
        lastname: 'Tiwari',
        role: USER_ROLES.ADMIN,
        tenantId: createUser.tenant.id,
      }

      const response = await request(app)
        .put(`/user/${createUser.id}`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send(upadtedUserData)
      expect(response.statusCode).toBe(400)
    })

    it('should return status code 400 if lastname is missing in payload', async () => {
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
      const upadtedUserData = {
        firstname: 'Savi2',
        role: USER_ROLES.ADMIN,
        tenantId: createUser.tenant.id,
      }

      const response = await request(app)
        .put(`/user/${createUser.id}`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send(upadtedUserData)
      expect(response.statusCode).toBe(400)
    })

    it('should return status code 400 if role is missing in payload', async () => {
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
      const upadtedUserData = {
        firstname: 'Savi2',
        lastname: 'Parihar',
        tenantId: createUser.tenant.id,
      }

      const response = await request(app)
        .put(`/user/${createUser.id}`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send(upadtedUserData)
      expect(response.statusCode).toBe(400)
    })

    it('should return status code 401 if  token is missing in cookie', async () => {
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
      const upadtedUserData = {
        firstname: 'Savi2',
        lastname: 'Parihar',
        tenantId: createUser.tenant.id,
      }

      const response = await request(app)
        .put(`/user/${createUser.id}`)
        .send(upadtedUserData)
      expect(response.statusCode).toBe(401)
    })

    it('should return status code 403 if customer token is  available in cookie', async () => {
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
      const upadtedUserData = {
        firstname: 'Savi2',
        lastname: 'Parihar',
        role: USER_ROLES.MANAGER,
        tenantId: createUser.tenant.id,
      }
      const customeToken = jwks.token({ sub: '1', role: USER_ROLES.CUSTOMER })

      const response = await request(app)
        .put(`/user/${createUser.id}`)
        .set('Cookie', `accessToken=${customeToken}`)
        .send(upadtedUserData)
      expect(response.statusCode).toBe(403)
    })
  })
})
