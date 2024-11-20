import { Repository } from 'typeorm'
import { User } from '../entity/User'
import { UserRequestBody } from '../types'
import createHttpError from 'http-errors'

export class UserService {
  constructor(
    // eslint-disable-next-line no-unused-vars
    private userRepository: Repository<User>,
  ) {}
  async create({ firstname, lastname, email, password }: UserRequestBody) {
    try {
      const user = await this.userRepository.save({
        firstname,
        lastname,
        email,
        password,
      })

      return user.id
    } catch (err) {
      console.log(err)
      const error = createHttpError(500, 'Error creating user in the Database')
      throw error
    }
  }
}
