import express from 'express'
import { AuthController } from '../controllers/AuthController'
import { UserService } from '../services/UserService'
import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'

// Note:-  Inversify.js can automate below process
const userRepository = AppDataSource.getRepository(User)
const userService = new UserService(userRepository)
const authController = new AuthController(userService)
const authRouter = express.Router()

// Can use any of both options for binding of this keyword
// authRouter.post('/register', authController.register.bind(authController))
authRouter.post('/register', async (req, res) => {
  await authController.register(req, res)
})

export default authRouter
