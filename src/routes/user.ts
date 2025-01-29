import express, { NextFunction, Request, Response } from 'express'
import logger from '../config/logger'
import { AppDataSource } from '../config/data-source'
import authenticate from '../middlewares/authenticate'
import { canAccess } from '../middlewares/canAccess'
import { USER_ROLES } from '../constants'
import { UserController } from '../controllers/UserController'
import { UserService } from '../services/UserService'
import { User } from '../entity/User'
import userRegistrationSchema from '../validation/register'
import { TenantService } from '../services/TenantService'
import { Tenant } from '../entity/Tenant'
import userUpadteSchema from '../validation/updateUser'

const userRouter = express.Router()
const tenantRepository = AppDataSource.getRepository(Tenant)
const userRepository = AppDataSource.getRepository(User)
const userService = new UserService(userRepository, tenantRepository)
const tenantService = new TenantService(tenantRepository)
const userController = new UserController(logger, userService, tenantService)
userRouter.post(
  '/',
  userRegistrationSchema,
  authenticate,
  canAccess([USER_ROLES.ADMIN, USER_ROLES.CUSTOMER]),
  async (req: Request, res: Response, next: NextFunction) => {
    await userController.create(req, res, next)
  },
)

userRouter.get(
  '/users-list',
  authenticate,
  canAccess([USER_ROLES.ADMIN, USER_ROLES.CUSTOMER]),
  async (req: Request, res: Response, next: NextFunction) => {
    await userController.findUsers(req, res, next)
  },
)

userRouter.get(
  '/:id',
  authenticate,
  canAccess([USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CUSTOMER]),
  async (req: Request, res: Response, next: NextFunction) => {
    await userController.findUser(req, res, next)
  },
)

userRouter.delete(
  '/:id',
  authenticate,
  canAccess([USER_ROLES.ADMIN, USER_ROLES.CUSTOMER]),
  async (req: Request, res: Response, next: NextFunction) => {
    await userController.deleteUser(req, res, next)
  },
)

userRouter.put(
  '/:id',
  userUpadteSchema,
  authenticate,
  canAccess([USER_ROLES.ADMIN, USER_ROLES.CUSTOMER]),
  async (req: Request, res: Response, next: NextFunction) => {
    await userController.updateUser(req, res, next)
  },
)

export default userRouter
