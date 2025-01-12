import { Repository } from 'typeorm'
import { User } from '../entity/User'
import { UserBodyDataType } from '../types'
import createHttpError, { HttpError } from 'http-errors'
import { USER_ROLES } from '../constants'

export class UserService {
  constructor(private userRepository: Repository<User>) {}
  async create({ firstname, lastname, email, password }: UserBodyDataType) {
    try {
      const userExist = await this.userRepository.findOne({ where: { email } })

      if (userExist) {
        throw createHttpError(400, 'Email already exists')
      }

      const user = await this.userRepository.save({
        firstname,
        lastname,
        email,
        password,
        role: USER_ROLES.CUSTOMER,
      })

      return user.id
    } catch (err) {
      console.log(err)
      const errorType = err as HttpError
      if (errorType?.status === 400) {
        throw err
      }
      const error = createHttpError(500, 'Error creating user in the Database')
      throw error
    }
  }

  async getUser(username: string) {
    const user = await this.userRepository.findOne({
      where: { email: username },
    })
    return user
  }

  async getUserById(id: string) {
    // eslint-disable-next-line no-useless-catch
    try {
      console.log('----------------', id)
      const user = await this.userRepository.findOne({
        where: { id },
      })
      return user
    } catch (error) {
      throw error
    }
  }
}
