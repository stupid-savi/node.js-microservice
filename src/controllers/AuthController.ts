import { NextFunction, Request, Response } from 'express'
import { UserRequestBody } from '../types'
import { UserService } from '../services/UserService'
import { Logger } from 'winston'
import bcrypt from 'bcrypt'
import createHttpError from 'http-errors'

export class AuthController {
  userService: UserService
  logger: Logger

  constructor(userService: UserService, logger: Logger) {
    this.userService = userService
    this.logger = logger
  }

  async register(
    req: Request<unknown, unknown, UserRequestBody>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { firstname, lastname, email, password } = req.body
      if (!firstname || !lastname || !email || !password) {
        throw createHttpError(400, 'Bad Request')
      }

      if (password.length > 72) {
        throw createHttpError(
          400,
          'Password cannot be greater than 72 characters',
        )
      }

      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(password, saltRounds)
      console.log(hashedPassword)

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
    }
  }
}
