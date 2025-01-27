import { Request } from 'express'
import { Response } from 'supertest'
export interface UserBodyDataType {
  firstname: string
  lastname: string
  email: string
  password: string
  role: string
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

export type TenantPayload = {
  name: string
  address: string
}

export interface TenantRequest extends Request {
  body: TenantPayload
}

export interface TenantListRes {
  message: string
  name: string
  address: string
  id: string
}

export interface TenantListResponse extends Response {
  body: {
    data: {
      tenants: TenantListRes[]
    }
  }
}

export interface TenantResponse extends Response {
  body: {
    data: {
      id: string
    }
  }
}

export interface UserCreationResponse extends Response {
  body: {
    id: string
  }
}

export interface userResponse extends Response {
  body: {
    id: string
    firstname: string
    lastname: string
    email: string
    password: string
    role: string
  }
}
