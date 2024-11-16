import { Request, Response } from 'express'

interface RegisterRequestBody {
  firstname: string
  lastname: string
  email: string
  password: string
}

export class AuthController {
  register(req: Request<unknown, unknown, RegisterRequestBody>, res: Response) {
    const { firstname, lastname, email, password } = req.body
    if (!firstname || !lastname || !email || !password) {
      res.status(400).json({ message: 'Bad Request' })
    }

    res.status(201).json()
  }
}
