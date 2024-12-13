import express, { NextFunction, Request, Response } from 'express'
import { AuthController } from '../controllers/AuthController'
import { UserService } from '../services/UserService'
import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'
import logger from '../config/logger'
import userRegistrationSchema from '../validation/register'
import { TokenService } from '../services/TokenService'
import { RefreshToken } from '../entity/RefreshToken'
import userLoginSchema from '../validation/login'

// Note:-  Inversify.js can automate below process
const authRouter = express.Router()
const userRepository = AppDataSource.getRepository(User)
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken)
const userService = new UserService(userRepository)
const tokenService = new TokenService(refreshTokenRepository)
const authController = new AuthController(userService, logger, tokenService)

// Can use any of both options for binding of this keyword
// authRouter.post('/register', authController.register.bind(authController))
authRouter.post(
  '/register',
  userRegistrationSchema,
  async (req: Request, res: Response, next: NextFunction) => {
    await authController.register(req, res, next)
  },
)

authRouter.post(
  '/login',
  userLoginSchema,
  async (req: Request, res: Response, next: NextFunction) => {
    await authController.login(req, res, next)
  },
)

export default authRouter
