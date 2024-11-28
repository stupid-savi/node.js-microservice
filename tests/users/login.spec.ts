import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { User } from '../../src/entity/User'
import request from 'supertest'
import app from '../../src/app'
import { isJwt } from '../utils/index'

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
    it('should return access token and refresh token in cookies', async () => {
      // Arrange
      const userPayload = {
        username: '1@gmail.com',
        password: 'Ghtupi@7897%',
      }

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

      console.log(accessToken, refreshToken)

      expect(accessToken).not.toBeNull()
      expect(accessToken).not.toBeNull()

      expect(isJwt(accessToken)).toBeTruthy()
      expect(isJwt(refreshToken)).toBeTruthy()
    })
  })

  describe('Fields are missing', () => {})

  //Sad Path
})
