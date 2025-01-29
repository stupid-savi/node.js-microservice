import { Logger } from 'winston'
import { UserService } from '../services/UserService'
import { Request, Response, NextFunction } from 'express'
import { UserRequestBody } from '../types'
import { validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import { USER_ROLES } from '../constants'
import { validate } from 'uuid'
import createHttpError from 'http-errors'
import { TenantService } from '../services/TenantService'

export class UserController {
  constructor(
    private logger: Logger,
    private userService: UserService,
    private tenantService: TenantService,
  ) {}

  async create(req: UserRequestBody, res: Response, next: NextFunction) {
    try {
      const { firstname, lastname, email, password, tenantId } = req.body

      const tenant = await this.tenantService.getTenantById(tenantId!)

      if (!tenant) {
        const error = createHttpError(400, 'Tenant not found')
        throw error
      }

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
        tenant: tenant,
      })

      const userId = await this.userService.create({
        firstname,
        lastname,
        email,
        password: hashedPassword,
        role: USER_ROLES.MANAGER,
        tenant: tenant,
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
      const [users, total] = await this.userService.getUsers(
        _page,
        _pageSize,
        searchQuery as string,
      )
      res.status(200).json({
        message: 'fetch user list successfully',
        data: { users, total },
      })
      return
    } catch (error) {
      this.logger.error('Error getting user list', { data: req.query })
      next(error)
      return
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      if (!id) {
        const error = createHttpError(400, 'User Id is missing')
        next(error)
        return
      }

      if (!validate(id)) {
        const error = createHttpError(400, 'user id is not valid uuid')
        next(error)
        return
      }

      const result = await this.userService.deleteUser(id)

      if (result.affected === 0) {
        const error = createHttpError(400, 'user id not found')
        throw error
      }

      res.status(200).json({ message: 'User deleted successfully' })
      return
    } catch (error) {
      this.logger.error('Error deleting the user', { id: req.params })
      next(error)
    }
  }

  async updateUser(req: UserRequestBody, res: Response, next: NextFunction) {
    try {
      const { firstname, lastname, tenantId, role } = req.body

      this.logger.debug('Request for debugging User request body', {
        firstname,
        lastname,
        tenantId,
        role,
      })

      const result = validationResult(req)
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() })
      }

      const { id } = req.params
      if (!id) {
        const error = createHttpError(400, 'User Id is missing')
        return next(error)
      }

      const updateResult = await this.userService.updateUser(
        id,
        firstname,
        lastname,
        role,
        tenantId!,
      )
      if (updateResult.affected === 0) {
        const error = createHttpError(400, 'Error updating the User')
        return next(error)
      }

      res.json({ message: 'User updated successfully' })
    } catch (error) {
      this.logger.error('Error updating the user', { id: req.params })
      next(error)
    }
  }
}
