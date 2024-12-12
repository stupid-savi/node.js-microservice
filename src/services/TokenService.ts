import createHttpError from 'http-errors'
import { JwtPayload, sign } from 'jsonwebtoken'
import fs from 'fs/promises'
import path from 'path'
import { CONFIG } from '../config'
import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'
import { RefreshToken } from '../entity/RefreshToken'
import { UserBodyDataType } from '../types'
import { Repository } from 'typeorm'

export class TokenService {
  constructor(private refreshTokenRepository: Repository<RefreshToken>) {}
  async generateAccessToken(payload: JwtPayload) {
    const privateKey = await this.getPrivateKey()

    const accessToken = sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '1h',
      issuer: 'auth-service',
    })

    return accessToken
  }

  async generateRefreshToken(
    payload: JwtPayload,
    user: User,
    refreshTokenExpiresAt: Date,
  ) {
    // const refreshTokenRepository = AppDataSource.getRepository(RefreshToken)
    const refreshTokenSaved = await this.persistRefreshToken(
      user,
      refreshTokenExpiresAt,
    )
    const refreshToken = sign(payload, CONFIG.REFRESH_TOKEN_SECRET as string, {
      algorithm: 'HS256',
      expiresIn: '30d',
      issuer: 'auth-service',
      jwtid: String(refreshTokenSaved.id),
    })

    return refreshToken
  }

  async persistRefreshToken(user: User, refreshTokenExpiresAt: Date) {
    const refreshTokenSaved = await this.refreshTokenRepository.save({
      user: user,
      expireAt: refreshTokenExpiresAt,
    })
    return refreshTokenSaved
  }

  async getPrivateKey() {
    let privateKey: Buffer

    try {
      privateKey = await fs.readFile(
        path.join(__dirname, '../../certs/private.pem'),
      )
      return privateKey
    } catch (err) {
      const error = createHttpError(500, 'Error reading private key')
      throw error
    }
  }
}
