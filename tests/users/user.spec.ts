import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { User } from '../../src/entity/User'
import request from 'supertest'
import app from '../../src/app'
import createJWKSMock from 'mock-jwks'
import { USER_ROLES } from '../../src/constants'
import { UserCreationResponse, userResponse } from '../../src/types'

describe('GET /auth/self', () => {
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
  })
})
