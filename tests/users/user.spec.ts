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

describe('GET /auth/self', () => {
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

  //Happy Path

  describe('Given all fields', () => {
    it('should return 200 status code', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
      }

      const userRepository = connection.getRepository(User)
      const data = await userRepository.save({
        ...userData,
        role: USER_ROLES.CUSTOMER,
      })
      const accessToken = jwks.token({ sub: data.id, role: data.role })
      const response = await request(app)
        .get('/auth/self')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send()

      expect(response.statusCode).toBe(200)
    })

    it('should return user data', async () => {
      // Register User

      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
      }

      const userRepository = connection.getRepository(User)
      const data = await userRepository.save({
        ...userData,
        role: USER_ROLES.CUSTOMER,
      })

      // Generate Token
      const accessToken = jwks.token({ sub: data.id, role: data.role })
      const response = await request(app)
        .get('/auth/self')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send()
      expect(response.body.id).toBe(data.id)
    })

    it('should not return password field', async () => {
      // Register User

      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
      }

      const userRepository = connection.getRepository(User)
      const data = await userRepository.save({
        ...userData,
        role: USER_ROLES.CUSTOMER,
      })

      // Generate Token
      const accessToken = jwks.token({ sub: data.id, role: data.role })
      const response = await request(app)
        .get('/auth/self')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send()
      expect(response.body as Record<string, string>).not.toHaveProperty(
        'password',
      )
    })
  })

  describe('Given all fields', () => {
    it('Should return status code 200 for getting specific user', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
      }
      const response = (await request(app)
        .post('/user')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(userData)) as UserCreationResponse
      const userResponse = await request(app)
        .get(`/user/${response.body.id}`)
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send()

      expect(userResponse.statusCode).toBe(200)
    })

    it('should return status code 200 for user list', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
      }
      const res = await request(app)
        .post('/user')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(userData)

      const response = await request(app)
        .get('/user/users-list')
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()

      console.log('12345', res.body, response.body)
      expect(response.statusCode).toBe(200)
      expect(response.body.data).toHaveProperty('users')
      expect(response.body.data.users).toHaveLength(1)
      expect(response.body.data.total).toBe(1)
    })

    it('should return searched user by role', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
      }
      await request(app)
        .post('/user')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(userData)
      const response = await request(app)
        .get('/user/users-list?searchQuery=manager')
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()

      expect(response.body.data.users[0].firstname).toEqual(userData.firstname)
      expect(response.body.data.users[0].lastname).toEqual(userData.lastname)
      expect(response.body.data.users[0].email).toEqual(userData.email)
      expect(response.body.data.users[0].role).toEqual(USER_ROLES.MANAGER)
    })

    it('should return searched user by firstname', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
      }
      await request(app)
        .post('/user')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(userData)
      const response = await request(app)
        .get('/user/users-list?searchQuery=Savi')
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()

      expect(response.body.data.users[0].firstname).toEqual(userData.firstname)
      expect(response.body.data.users[0].lastname).toEqual(userData.lastname)
      expect(response.body.data.users[0].email).toEqual(userData.email)
      expect(response.body.data.users[0].role).toEqual(USER_ROLES.MANAGER)
    })

    it('should return searched user by lastname', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
      }
      await request(app)
        .post('/user')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(userData)
      const response = await request(app)
        .get('/user/users-list?searchQuery=Singh')
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()

      expect(response.body.data.users[0].firstname).toEqual(userData.firstname)
      expect(response.body.data.users[0].lastname).toEqual(userData.lastname)
      expect(response.body.data.users[0].email).toEqual(userData.email)
      expect(response.body.data.users[0].role).toEqual(USER_ROLES.MANAGER)
    })

    it('should return searched user by email', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
      }
      await request(app)
        .post('/user')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(userData)
      const response = await request(app)
        .get('/user/users-list?searchQuery=1@gmail.com')
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()

      expect(response.body.data.users[0].firstname).toEqual(userData.firstname)
      expect(response.body.data.users[0].lastname).toEqual(userData.lastname)
      expect(response.body.data.users[0].email).toEqual(userData.email)
      expect(response.body.data.users[0].role).toEqual(USER_ROLES.MANAGER)
    })

    it('should not contain password field', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
      }
      await request(app)
        .post('/user')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(userData)
      const response = await request(app)
        .get('/user/users-list?searchQuery=1@gmail.com')
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()

      expect(response.body.data.users[0]).not.toHaveProperty('password')
    })

    it('Should return specific user', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
      }
      const response = (await request(app)
        .post('/user')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(userData)) as UserCreationResponse

      const userResponse = (await request(app)
        .get(`/user/${response.body.id}`)
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send()) as userResponse

      expect(response.body.id).toBe(userResponse.body.id)
    })
  })

  // Sad Path

  describe('Missing token and fields', () => {
    it('should return status code 401 if token not available', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
      }

      const userRepository = connection.getRepository(User)
      const data = await userRepository.save({
        ...userData,
        role: USER_ROLES.CUSTOMER,
      })

      const response = await request(app).get('/auth/self').send()

      expect(response.statusCode).toBe(401)
    })

    it('should return status 404 if user id is not available', async () => {
      const userResponse = (await request(app)
        .get(`/user/`)
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send()) as userResponse
      expect(userResponse.statusCode).toBe(404)
    })

    it('should return status 400 if  user id is not uuid', async () => {
      const userResponse = (await request(app)
        .get(`/user/12323213123`)
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send()) as userResponse
      expect(userResponse.statusCode).toBe(400)
    })

    it('should return status 400 if user id is not valid', async () => {
      const userResponse = (await request(app)
        .get(`/user/f28f6dc1-36e2-43a5-81c8-16445911c505`)
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send()) as userResponse
      expect(userResponse.statusCode).toBe(400)
    })

    it('should return empty user list if pageNo. is more than avilable items', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
      }
      const res = await request(app)
        .post('/user')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(userData)

      const response = await request(app)
        .get('/user/users-list?page=2')
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()

      expect(response.body.data).toHaveProperty('users')
      expect(response.body.data.users).toHaveLength(0)
      expect(response.body.data.total).toBe(1)
    })

    it('should return empty user list if searchQuery not matched', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
      }
      const res = await request(app)
        .post('/user')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(userData)

      const response = await request(app)
        .get('/user/users-list?searchQuery=Ram')
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()

      expect(response.body.data).toHaveProperty('users')
      expect(response.body.data.users).toHaveLength(0)
      expect(response.body.data.total).toBe(0)
    })
  })
})
