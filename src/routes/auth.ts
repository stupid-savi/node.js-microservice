import express from 'express'
import { AuthController } from '../controllers/AuthController'

const authController = new AuthController()
const authRouter = express.Router()

// Can use any of both options for binding of this keyword
authRouter.post('/register', authController.register.bind(authController))
// authRouter.post('/register', (req, res) => {
//   authController.register(req, res)
// })

export default authRouter
