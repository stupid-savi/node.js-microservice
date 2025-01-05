import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import request from 'supertest'
import app from '../../src/app'
import { User } from '../../src/entity/User'
import { USER_ROLES } from '../../src/constants'
import { RefreshToken } from '../../src/entity/RefreshToken'
import { JwtPayload, sign } from 'jsonwebtoken'
import { CONFIG } from '../../src/config'

describe('POST /auth/refresh', () => {
  let connection: DataSource
  beforeAll(async () => {
    connection = await AppDataSource.initialize()
  })

  beforeEach(async () => {
    await connection.dropDatabase()
    await connection.synchronize()
  })

  afterEach(() => {})

  afterAll(async () => {
    await connection.destroy()
  })

  describe('Given all fields', () => {
    it('Should return status code 200 if refresh token is present in cookies and valid', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
      }

      const userRepository = connection.getRepository(User)
      const user = await userRepository.save({
        ...userData,
        role: USER_ROLES.CUSTOMER,
      })

      const MS_IN_MONTH = 1000 * 60 * 60 * 24 * 30
      const refreshTokenExpiresAt = new Date(Date.now() + MS_IN_MONTH)
      const refreshTokenRepository = connection.getRepository(RefreshToken)
      const refreshToken = await refreshTokenRepository.save({
        user: user,
        expireAt: refreshTokenExpiresAt,
      })
      const payload: JwtPayload = {
        sub: user.id,
        role: 'customer',
        id: refreshToken.id,
      }
      const token = sign(payload, CONFIG.REFRESH_TOKEN_SECRET as string, {
        algorithm: 'HS256',
        expiresIn: '30d',
        issuer: 'auth-service',
        jwtid: String(refreshToken.id),
      })

      const response = await request(app)
        .post('/auth/refresh')
        .set('Cookie', [`refreshToken=${token};`])
        .send()
      expect(response.statusCode).toBe(200)
    })
  })

  describe('fields are missing', () => {
    it('should return status code 401 if token is missing in cookies', async () => {
      const response = await request(app).post('/auth/refresh').send()
      expect(response.statusCode).toBe(401)
    })

    it('should return status code 401 if token is revoked', async () => {
      const payload: JwtPayload = {
        sub: '9d6dd60b-5dfe-4038-9cf5-261a60ce8197',
        role: 'customer',
      }
      const token = sign(payload, CONFIG.REFRESH_TOKEN_SECRET as string, {
        algorithm: 'HS256',
        expiresIn: '30d',
        issuer: 'auth-service',
        jwtid: '9d6dd60b-5dfe-4038-9cf5-261a60ce8190',
      })
      const response = await request(app)
        .post('/auth/refresh')
        .set('Cookie', [`refreshToken=${token}`])
        .send()
      expect(response.statusCode).toBe(401)
    })

    it('should delete old token form the db', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
      }

      const userRepository = connection.getRepository(User)
      const user = await userRepository.save({
        ...userData,
        role: USER_ROLES.CUSTOMER,
      })

      const MS_IN_MONTH = 1000 * 60 * 60 * 24 * 30
      const refreshTokenExpiresAt = new Date(Date.now() + MS_IN_MONTH)
      const refreshTokenRepository = connection.getRepository(RefreshToken)
      const refreshToken = await refreshTokenRepository.save({
        user: user,
        expireAt: refreshTokenExpiresAt,
      })
      const payload: JwtPayload = {
        sub: user.id,
        role: 'customer',
        id: refreshToken.id,
      }
      const token = sign(payload, CONFIG.REFRESH_TOKEN_SECRET as string, {
        algorithm: 'HS256',
        expiresIn: '30d',
        issuer: 'auth-service',
        jwtid: String(refreshToken.id),
      })

      const response = await request(app)
        .post('/auth/refresh')
        .set('Cookie', [`refreshToken=${token};`])
        .send()

      const refreshTokens = await refreshTokenRepository.find({
        where: { user: { id: user.id } },
      })
      expect(refreshTokens?.length).toBe(1)
    })
  })
})
