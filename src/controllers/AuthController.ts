import { NextFunction, Request, Response } from 'express'
import { UserRequestBody } from '../types'
import { UserService } from '../services/UserService'
import { Logger } from 'winston'

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
    const { firstname, lastname, email, password } = req.body
    if (!firstname || !lastname || !email || !password) {
      res.status(400).json({ message: 'Bad Request' })
    }

    this.logger.debug('create user request receive', {
      firstname,
      lastname,
      email,
      password: '*******',
    })

    try {
      const userId = await this.userService.create({
        firstname,
        lastname,
        email,
        password,
      })

      this.logger.info('user created', { id: userId })

      res.status(201).json({ id: userId })
    } catch (err) {
      next(err)
      return
    }
  }
}
