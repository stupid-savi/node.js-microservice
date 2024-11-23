import { NextFunction, Response } from 'express'
import { UserRequestBody } from '../types'
import { UserService } from '../services/UserService'
import { Logger } from 'winston'
import bcrypt from 'bcrypt'
import { validationResult } from 'express-validator'

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
      console.log('results', result)

      if (!result.isEmpty()) {
        res.status(400).json({ errors: result.array() })
        return
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
