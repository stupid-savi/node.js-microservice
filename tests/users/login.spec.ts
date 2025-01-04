import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { User } from '../../src/entity/User'
import request from 'supertest'
import app from '../../src/app'
import { isJwt } from '../utils/index'
import { RefreshToken } from '../../src/entity/RefreshToken'

interface Headers {
  ['set-cookie']: string[]
}

describe('POST /auth/login', () => {
  let connection: DataSource
  beforeAll(async () => {
    connection = await AppDataSource.initialize()
  })

  beforeEach(async () => {
    await connection.dropDatabase()
    await connection.synchronize()
  })

  afterAll(async () => {
    await connection.destroy()
  })

  //Happy Path

  describe('Given all fields', () => {
    it('should return status code 200 for successful login', async () => {
      const userPayload = {
        username: 'savi2@yopmail.com',
        password: 'Test@988989',
      }

      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: 'savi2@yopmail.com',
        password: 'Test@988989',
      }

      await request(app as any)
        .post('/auth/register')
        .send(userData)

      const response = await request(app).post('/auth/login').send(userPayload)

      expect(response.statusCode).toBe(200)
    })

    it('should return access token and refresh token in cookies', async () => {
      // Arrange
      const userPayload = {
        username: 'savi2@yopmail.com',
        password: 'Test@988989',
      }

      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: 'savi2@yopmail.com',
        password: 'Test@988989',
      }

      await request(app as any)
        .post('/auth/register')
        .send(userData)

      // Act
      const response = await request(app).post('/auth/login').send(userPayload)

      // Assert

      const cookies =
        (response.headers as unknown as Headers)['set-cookie'] || []
      let accessToken: string | null = null
      let refreshToken: string | null = null
      //   Set-Cookie: accessToken=your-jwt-access-token; HttpOnly; Secure; SameSite=Strict; Max-Age=3600; Path=/;
      //   Set-Cookie: refreshToken=your-refresh-token; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000; Path=/;

      cookies.forEach((cookie) => {
        if (cookie.startsWith('accessToken=')) {
          accessToken = cookie.split(';')[0].split('=')[1]
        }

        if (cookie.startsWith('refreshToken=')) {
          refreshToken = cookie.split(';')[0].split('=')[1]
        }
      })

      expect(accessToken).not.toBeNull()
      expect(accessToken).not.toBeNull()

      expect(isJwt(accessToken)).toBeTruthy()
      expect(isJwt(refreshToken)).toBeTruthy()
    })

    it('should persist the refresh token in the database', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
      }

      await request(app as any)
        .post('/auth/register')
        .send(userData)
      // Act -  Trigger the actual logic like call the api endpoint

      const userPayload = {
        username: '1@gmail.com',
        password: 'Test@9767$%13456',
      }

      await request(app).post('/auth/login').send(userPayload)

      const refreshTokenRepository = connection.getRepository(RefreshToken)
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      const userId = users[0]?.id

      const refreshTokens = await refreshTokenRepository
        .createQueryBuilder('refreshToken')
        .where('refreshToken.userId = :userId', {
          userId,
        })
        .getMany()

      expect(refreshTokens).toHaveLength(1)
    })

    it('should return a valid json', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
      }

      await request(app as any)
        .post('/auth/register')
        .send(userData)
      // Act -  Trigger the actual logic like call the api endpoint

      const userPayload = {
        username: '1@gmail.com',
        password: 'Test@9767$%13456',
      }

      const response = await request(app).post('/auth/login').send(userPayload)

      expect(response.headers['content-type']).toEqual(
        expect.stringContaining('json'),
      )
    })

    it('should return a user id of logged in user', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
      }

      await request(app as any)
        .post('/auth/register')
        .send(userData)

      const userPayload = {
        username: '1@gmail.com',
        password: 'Test@9767$%13456',
      }

      const response = await request(app).post('/auth/login').send(userPayload)

      const userRepository = connection.getRepository(User)
      const email = userPayload.username

      const findUser = await userRepository
        .createQueryBuilder('user')
        .where('user.email = :email', { email })
        .getMany()

      expect(findUser.length).toBe(1)
      expect(findUser[0].id).toEqual(response.body.id)
    })
  })

  describe('Fields are missing', () => {
    it('should status code 404 for invalid email', async () => {
      const userPayload = {
        username: 'savi02@yopmail.com',
        password: 'Test@988989',
      }

      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: 'savi2@yopmail.com',
        password: 'Test@988989',
      }

      await request(app as any)
        .post('/auth/register')
        .send(userData)

      const response = await request(app).post('/auth/login').send(userPayload)

      expect(response.statusCode).toBe(400)
    })

    it('should status code 404 for invalid password', async () => {
      const userPayload = {
        username: 'savi2@yopmail.com',
        password: 'Test@98809089',
      }

      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: 'savi2@yopmail.com',
        password: 'Test@988989',
      }

      await request(app as any)
        .post('/auth/register')
        .send(userData)

      const response = await request(app).post('/auth/login').send(userPayload)

      expect(response.statusCode).toBe(400)
    })

    it('should status code 404 for invalid payload', async () => {
      const userPayload = {}

      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: 'savi2@yopmail.com',
        password: 'Test@988989',
      }

      await request(app as any)
        .post('/auth/register')
        .send(userData)

      const response = await request(app).post('/auth/login').send(userPayload)

      expect(response.statusCode).toBe(400)
    })
  })

  //Sad Path
})
