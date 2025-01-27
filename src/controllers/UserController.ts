import { Logger } from 'winston'
import { UserService } from '../services/UserService'
import { Request, Response, NextFunction } from 'express'
import { UserRequestBody } from '../types'
import { validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import { USER_ROLES } from '../constants'
import { validate } from 'uuid'
import createHttpError from 'http-errors'

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
  async findUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      if (!id) {
        const error = createHttpError(400, "user id can't be empty")
        next(error)
        return
      }
      if (!validate(id)) {
        const error = createHttpError(400, 'user id is not valid uuid')
        next(error)
        return
      }
      const user = await this.userService.getUserById(id)
      if (!user) {
        const error = createHttpError(400, 'user not found')
        next(error)
        return
      }
      this.logger.info('manager created', { id: user.id })
      res.json({ ...user, password: undefined })
      return
    } catch (error) {
      next(error)
      return
    }
  }

  async findUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, pageSize = 10, searchQuery = '' } = req.query || {}

      const _page = +page
      const _pageSize = +pageSize
      console.log(_page, _pageSize)
      console.log(req.query)
      const [tenants, total] = await this.userService.getUsers(
        _page,
        _pageSize,
        searchQuery as string,
      )
      res.status(200).json({
        message: 'fetch user list successfully',
        data: { tenants, total },
      })
      return
    } catch (error) {
      this.logger.error('Error getting user list', { data: req.query })
      next(error)
      return
    }
  }
}
