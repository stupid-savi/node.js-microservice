import { Logger } from 'winston'
import { UserService } from '../services/UserService'
import { Response, NextFunction } from 'express'
import { UserRequestBody } from '../types'
import { validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import { USER_ROLES } from '../constants'

export class UserController {
  constructor(
    private logger: Logger,
    private userService: UserService,
  ) {}

  async create(req: UserRequestBody, res: Response, next: NextFunction) {
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
        role: USER_ROLES.MANAGER,
      })

      this.logger.info('manager created', { id: userId })

      res.status(201).json({ id: userId })
    } catch (err) {
      next(err)
      return
    }
  }
}
