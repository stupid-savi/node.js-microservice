import { NextFunction, Response } from 'express'
import { UserLoginRequestBody, UserRequestBody } from '../types'
import { UserService } from '../services/UserService'
import { Logger } from 'winston'
import bcrypt from 'bcrypt'
import { validationResult } from 'express-validator'
import { JwtPayload, sign } from 'jsonwebtoken'
import fs from 'fs/promises'
import path from 'path'
import createHttpError from 'http-errors'
import { CONFIG } from '../config'

export class AuthController {
  userService: UserService
  logger: Logger

  constructor(userService: UserService, logger: Logger) {
    this.userService = userService
    this.logger = logger
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

      // Check if user exists and password matches :- TODO

      let privateKey: Buffer

      try {
        privateKey = await fs.readFile(
          path.join(__dirname, '../../certs/private.pem'),
        )
      } catch (err) {
        const error = createHttpError(500, 'Error reading private key')
        next(error)
        return
      }
      const payload: JwtPayload = {
        sub: username,
        role: 'customer',
      }

      const accessToken = sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: '1h',
        issuer: 'auth-service',
      })

      const refreshToken = sign(
        payload,
        CONFIG.REFRESH_TOKEN_SECRET as string,
        {
          algorithm: 'HS256',
          expiresIn: '30d',
          issuer: 'auth-service',
        },
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

      res.status(200).json({})
    } catch (error) {
      next(error)
      return
    }
  }
}
