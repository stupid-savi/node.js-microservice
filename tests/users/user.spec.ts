import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { User } from '../../src/entity/User'
import request from 'supertest'
import app from '../../src/app'
import { isJwt } from '../utils/index'
import { RefreshToken } from '../../src/entity/RefreshToken'
import createJWKSMock from 'mock-jwks'
import { USER_ROLES } from '../../src/constants'

interface Headers {
  ['set-cookie']: string[]
}

describe('GET /auth/self', () => {
  let connection: DataSource
  let jwks: ReturnType<typeof createJWKSMock>
  beforeAll(async () => {
    jwks = createJWKSMock('http://localhost:5600')
    connection = await AppDataSource.initialize()
  })

  beforeEach(async () => {
    jwks.start()
    await connection.dropDatabase()
    await connection.synchronize()
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
      const response = await request(app).get('/auth/self').send()
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
  })

  //Sad Path
})
