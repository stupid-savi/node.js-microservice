import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import request from 'supertest'
import app from '../../src/app'
import { User } from '../../src/entity/User'
import { USER_ROLES } from '../../src/constants'
import { RefreshToken } from '../../src/entity/RefreshToken'
import { JwtPayload, sign } from 'jsonwebtoken'
import { CONFIG } from '../../src/config'
import createJWKSMock from 'mock-jwks'

describe('POST /auth/logout', () => {
  let connection: DataSource
  let jwks: ReturnType<typeof createJWKSMock>
  beforeAll(async () => {
    jwks = createJWKSMock('http://localhost:8085')

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

  describe('Given all fields', () => {
    it('should return status code 204 for successful logout', async () => {
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

      const accessTokenGenerated = jwks.token({ sub: user.id, role: user.role })

      const refreshTokeGenerated = sign(
        payload,
        CONFIG.REFRESH_TOKEN_SECRET as string,
        {
          algorithm: 'HS256',
          expiresIn: '30d',
          issuer: 'auth-service',
          jwtid: String(refreshToken.id),
        },
      )
      const response = await request(app)
        .post('/auth/logout')
        .set('Cookie', [
          `accessToken=${accessTokenGenerated};refreshToken=${refreshTokeGenerated};`,
        ])
        .send()

      expect(response.statusCode).toBe(204)
    })
  })

  describe('fields are missing', () => {
    it('should return status code 401 if access token is missing', async () => {
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

      const refreshTokeGenerated = sign(
        payload,
        CONFIG.REFRESH_TOKEN_SECRET as string,
        {
          algorithm: 'HS256',
          expiresIn: '30d',
          issuer: 'auth-service',
          jwtid: String(refreshToken.id),
        },
      )
      const response = await request(app)
        .post('/auth/logout')
        .set('Cookie', [`refreshToken=${refreshTokeGenerated};`])
        .send()

      expect(response.statusCode).toBe(401)
    })

    it('should return status code 401 if refresh token is missing', async () => {
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

      const accessTokenGenerated = jwks.token({ sub: user.id, role: user.role })
      const response = await request(app)
        .post('/auth/logout')
        .set('Cookie', [`accessToken=${accessTokenGenerated};`])
        .send()

      expect(response.statusCode).toBe(401)
    })

    it('should return status code 401 if either access or refresh token is tempared', async () => {
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

      const response = await request(app)
        .post('/auth/logout')
        .set('Cookie', [
          `accessToken=${'Ehfjksjdksajdksajdkajdkajd'};refreshToken=${'Eghsjdisdsdlskdlskd'};`,
        ])
        .send()

      expect(response.statusCode).toBe(401)
    })
  })
})
