import { NextFunction, Response, Request } from 'express'
import { RequestAuth, UserLoginRequestBody, UserRequestBody } from '../types'
import { UserService } from '../services/UserService'
import { Logger } from 'winston'
import bcrypt from 'bcrypt'
import { validationResult } from 'express-validator'
import { JwtPayload } from 'jsonwebtoken'
import { TokenService } from '../services/TokenService'
import createHttpError from 'http-errors'
import { CredentialService } from '../services/CredentialService'
import { USER_ROLES } from '../constants'

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
        role: USER_ROLES.CUSTOMER,
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
        sub: user.id,
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

  async self(req: RequestAuth, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.getUserById(req.auth.sub)
      if (!user) {
        const error = createHttpError(404, `user not found`)
        throw error
      }
      res.json({ ...user, password: undefined })
      return
    } catch (err) {
      next(err)
      return
    }
  }

  async refresh(req: RequestAuth, res: Response, next: NextFunction) {
    try {
      const payload: JwtPayload = {
        sub: req.auth.sub,
        role: req.auth.role,
      }

      const user = await this.userService.getUserById(req.auth.sub)

      if (!user) {
        const error = createHttpError(
          400,
          `Error finding the user with refresh token`,
        )
        this.logger.error('Error finding the user with refresh token', {
          userId: req.auth.sub,
        })
        throw error
      }

      await this.tokenService.deleteRefreshToken(req.auth.id)
      const accessToken = await this.tokenService.generateAccessToken(payload)
      this.logger.info('Generating new access token', { userId: req.auth.sub })
      const MS_IN_MONTH = 1000 * 60 * 60 * 24 * 30
      const refreshTokenExpiresAt = new Date(Date.now() + MS_IN_MONTH)
      const newRefreshToken = await this.tokenService.generateRefreshToken(
        payload,
        user,
        refreshTokenExpiresAt,
      )
      this.logger.info('Generating new refresh token', { userId: req.auth.sub })

      res.cookie('accessToken', accessToken, {
        domain: 'localhost',
        maxAge: 1000 * 60 * 60, // 1 hour
        sameSite: 'strict',
        httpOnly: true,
      })

      res.cookie('refreshToken', newRefreshToken, {
        domain: 'localhost',
        maxAge: 1000 * 60 * 60 * 24 * 30, // 1 month
        sameSite: 'strict',
        httpOnly: true,
      })

      this.logger.info('Token genreated', { id: user.id })

      res.status(200).json({ id: user.id })
    } catch (error) {
      next(error)
      return
    }
  }

  async logout(req: RequestAuth, res: Response, next: NextFunction) {
    try {
      const refreshTokenId = req.auth.id
      await this.tokenService.deleteRefreshToken(refreshTokenId)
      res.clearCookie('accessToken')
      res.clearCookie('refreshToken')
      res.status(204).json({})
    } catch (error) {
      next(error)
      return
    }
  }
}
