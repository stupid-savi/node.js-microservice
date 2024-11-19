import { Request, Response } from 'express'
import { UserRequestBody } from '../types'
import { UserService } from '../services/UserService'

export class AuthController {
  userService: UserService

  constructor(userService: UserService) {
    this.userService = userService
  }

  async register(
    req: Request<unknown, unknown, UserRequestBody>,
    res: Response,
  ) {
    const { firstname, lastname, email, password } = req.body
    if (!firstname || !lastname || !email || !password) {
      res.status(400).json({ message: 'Bad Request' })
    }

    await this.userService.create({ firstname, lastname, email, password })

    return res.status(201).json()
  }
}
