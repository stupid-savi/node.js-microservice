import express, { NextFunction, Request, Response } from 'express'
import { AuthController } from '../controllers/AuthController'
import { UserService } from '../services/UserService'
import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'
import logger from '../config/logger'
import userRegistrationSchema from '../validation/register'

// Note:-  Inversify.js can automate below process
const authRouter = express.Router()
const userRepository = AppDataSource.getRepository(User)
const userService = new UserService(userRepository)
const authController = new AuthController(userService, logger)

// Can use any of both options for binding of this keyword
// authRouter.post('/register', authController.register.bind(authController))
authRouter.post(
  '/register',
  userRegistrationSchema,
  async (req: Request, res: Response, next: NextFunction) => {
    await authController.register(req, res, next)
  },
)

export default authRouter
