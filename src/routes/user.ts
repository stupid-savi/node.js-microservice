import express, { NextFunction, Request, Response } from 'express'
import { TenantController } from '../controllers/TenantController'
import logger from '../config/logger'
import { TenantService } from '../services/TenantService'
import { Tenant } from '../entity/Tenant'
import { AppDataSource } from '../config/data-source'
import tenantSchema from '../validation/tenant'
import authenticate from '../middlewares/authenticate'
import { canAccess } from '../middlewares/canAccess'
import { USER_ROLES } from '../constants'
import { UserController } from '../controllers/UserController'
import { UserService } from '../services/UserService'
import { User } from '../entity/User'
import userRegistrationSchema from '../validation/register'

const userRouter = express.Router()
const userRepository = AppDataSource.getRepository(User)
const userService = new UserService(userRepository)
const userController = new UserController(logger, userService)
userRouter.post(
  '/',
  userRegistrationSchema,
  authenticate,
  canAccess([USER_ROLES.ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    await userController.create(req, res, next)
  },
)

userRouter.get(
  '/:id',
  authenticate,
  canAccess([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  async (req: Request, res: Response, next: NextFunction) => {
    await userController.findUser(req, res, next)
  },
)

export default userRouter
