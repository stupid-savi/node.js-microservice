import { expressjwt } from 'express-jwt'
import { CONFIG } from '../config'
import { Request } from 'express'
import { AuthCookie } from '../types'

export default expressjwt({
  secret: CONFIG.REFRESH_TOKEN_SECRET!,
  algorithms: ['HS256'],
  getToken(req: Request) {
    const { refreshToken } = req.cookies as AuthCookie
    return refreshToken
  },
})
