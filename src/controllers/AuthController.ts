import { NextFunction, Response } from 'express'
import { UserLoginRequestBody, UserRequestBody } from '../types'
import { UserService } from '../services/UserService'
import { Logger } from 'winston'
import bcrypt from 'bcrypt'
import { validationResult } from 'express-validator'
import { JwtPayload, sign } from 'jsonwebtoken'
import { TokenService } from '../services/TokenService'
import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'
import createHttpError from 'http-errors'
import { CredentialService } from '../services/CredentialService'

export class AuthController {
  userService: UserService
  logger: Logger
  tokenService: TokenService
  credentialService: CredentialService

  constructor(
    userService: UserService,
    logger: Logger,
    tokenService: TokenService,
    credentialService: CredentialService,
  ) {
    this.userService = userService
    this.logger = logger
    this.tokenService = tokenService
    this.credentialService = credentialService
  }

  async register(req: UserRequestBody, res: Response, next: NextFunction) {
    try {
      const { firstname, lastname, email, password } = req.body

      const result = validationResult(req)

      if (!result.isEmpty()) {
        res.status(400).json({ errors: result.array() })
        return
      }

      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      this.logger.debug('create user request receive', {
        firstname,
        lastname,
        email,
        password: hashedPassword,
      })

      const userId = await this.userService.create({
        firstname,
        lastname,
        email,
        password: hashedPassword,
      })

      this.logger.info('user created', { id: userId })

      res.status(201).json({ id: userId })
    } catch (err) {
      next(err)
      return
    }
  }

  async login(req: UserLoginRequestBody, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body

      const result = validationResult(req)

      if (!result.isEmpty()) {
        res.status(400).json({ errors: result.array() })
        return
      }
      console.log(username, 123)

      const user = await this.userService.getUser(username)

      if (!user) {
        const error = createHttpError(400, `email or password is wrong`)
        throw error
      }

      const isValidPassword = await this.credentialService.comparePassword(
        password,
        user.password,
      )

      if (!isValidPassword) {
        const error = createHttpError(400, `email or password is wrong`)
        throw error
      }

      // Check if user exists and password matches :- TODO
      const payload: JwtPayload = {
        sub: username,
        role: 'customer',
      }

      const accessToken = await this.tokenService.generateAccessToken(payload)

      // persist the refresh token
      const MS_IN_MONTH = 1000 * 60 * 60 * 24 * 30
      const refreshTokenExpiresAt = new Date(Date.now() + MS_IN_MONTH)

      const refreshToken = await this.tokenService.generateRefreshToken(
        payload,
        user,
        refreshTokenExpiresAt,
      )

      console.log(accessToken)
      console.log(refreshToken)

      res.cookie('accessToken', accessToken, {
        domain: 'localhost',
        maxAge: 1000 * 60 * 60, // 1 hour
        sameSite: 'strict',
        httpOnly: true,
      })

      res.cookie('refreshToken', refreshToken, {
        domain: 'localhost',
        maxAge: 1000 * 60 * 60 * 24 * 30, // 1 month
        sameSite: 'strict',
        httpOnly: true,
      })

      this.logger.info('user created', { id: user.id })

      res.status(200).json({ id: user.id })
    } catch (error) {
      next(error)
      return
    }
  }
}
