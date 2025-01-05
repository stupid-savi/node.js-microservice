import { expressjwt } from 'express-jwt'
import { CONFIG } from '../config'
import { Request } from 'express'
import { AuthCookie, RefreshTokenType } from '../types'
import { AppDataSource } from '../config/data-source'
import { RefreshToken } from '../entity/RefreshToken'
import logger from '../config/logger'

export default expressjwt({
  secret: CONFIG.REFRESH_TOKEN_SECRET!,
  algorithms: ['HS256'],
  getToken(req: Request) {
    const { refreshToken } = req.cookies as AuthCookie
    return refreshToken
  },
  async isRevoked(_, token) {
    try {
      const refreshTokenRepository = AppDataSource.getRepository(RefreshToken)
      console.log('token payload', token?.payload)
      const refreshTokenFound = await refreshTokenRepository.findOne({
        where: {
          id: (token?.payload as RefreshTokenType).id,
          user: { id: (token?.payload as RefreshTokenType)?.sub },
        },
      })

      console.log('jwt token found', refreshTokenFound)
      return refreshTokenFound === null
    } catch (error) {
      console.log('revoked')
      logger.error('Error while getting refresh token', {
        id: (token?.payload as RefreshTokenType)?.id,
        userid: token?.payload?.sub,
      })
      return true
    }
  },
})
