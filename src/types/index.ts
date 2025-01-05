import { Request, Response } from 'express'
export interface UserBodyDataType {
  firstname: string
  lastname: string
  email: string
  password: string
}

export interface UserLoginPayload {
  username: string
  password: string
}

export interface UserRequestBody extends Request {
  body: UserBodyDataType
}

export interface UserLoginRequestBody extends Request {
  body: UserLoginPayload
}

export interface RequestAuth extends Request {
  auth: {
    sub: string
    role: string
    id: string
    jti: string
  }
}
export type AuthCookie = {
  accessToken: string
  refreshToken: string
}

export type RefreshTokenType = {
  sub: string
  id: string
  jti: string
}
