import { Repository } from 'typeorm'
import { User } from '../entity/User'
import { UserBodyDataType } from '../types'
import createHttpError, { HttpError } from 'http-errors'
import { USER_ROLES } from '../constants'
import { nextTick } from 'process'
import { Tenant } from '../entity/Tenant'

export class UserService {
  constructor(
    private userRepository: Repository<User>,
    private tenantRepository: Repository<Tenant>,
  ) {}
  async create({
    firstname,
    lastname,
    email,
    password,
    role,
    tenant,
  }: UserBodyDataType) {
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
        role,
        tenant,
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
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['tenant'],
      })
      return user
    } catch (error) {
      throw error
    }
  }

  async getUsers(page: number, pageSize: number, searchQuery: string) {
    const queryBuilder = this.userRepository.createQueryBuilder('user')
    if (searchQuery && searchQuery.trim() !== '') {
      queryBuilder.where(
        'user.firstname LIKE :searchQuery OR user.lastname LIKE :searchQuery OR user.email LIKE :searchQuery OR user.role LIKE :searchQuery',
        {
          searchQuery: `%${searchQuery}%`,
        },
      )
    }
    queryBuilder.select([
      'user.id',
      'user.firstname',
      'user.lastname',
      'user.email',
      'user.role',
    ])
    queryBuilder.leftJoinAndSelect('user.tenant', 'tenant')
    queryBuilder.skip((page - 1) * pageSize)
    queryBuilder.take(pageSize)
    const [users, total] = await queryBuilder.getManyAndCount()
    const totalCount = Math.ceil(total / pageSize)
    return [users, totalCount]
  }

  async deleteUser(id: string) {
    const findUser = await this.userRepository.findOne({ where: { id } })

    if (!findUser) {
      const error = createHttpError(400, 'User not found with this user id')
      throw error
    }
    const result = await this.userRepository.delete(id)
    return result
  }

  async updateUser(
    id: string,
    firstname: string,
    lastname: string,
    role: string,
    tenantId: string,
  ) {
    const findUser = await this.userRepository.findOne({ where: { id } })
    if (!findUser) {
      const error = createHttpError(400, 'User not found with this user id')
      throw error
    }

    console.log('tenantId', tenantId)
    const upadteData: Record<string, string | Tenant> = {
      firstname,
      lastname,
      role,
    }
    if (tenantId) {
      const findTenant = await this.tenantRepository.findOne({
        where: { id: tenantId },
      })
      if (!findTenant) {
        const error = createHttpError(400, 'Tenant id not found')
        throw error
      }
      upadteData.tenant = findTenant
    }

    const updateUser = await this.userRepository.update(id, upadteData)

    return updateUser
  }
}
