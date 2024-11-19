import { Repository } from 'typeorm'
import { User } from '../entity/User'
import { UserRequestBody } from '../types'

export class UserService {
  // eslint-disable-next-line no-unused-vars
  constructor(private userRepository: Repository<User>) {}
  async create({ firstname, lastname, email, password }: UserRequestBody) {
    const user = await this.userRepository.save({
      firstname,
      lastname,
      email,
      password,
    })

    return user.id
  }
}
