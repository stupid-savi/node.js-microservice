import { Repository } from 'typeorm'
import { TenantPayload } from '../types'
import { Tenant } from '../entity/Tenant'
import createHttpError from 'http-errors'
export class TenantService {
  constructor(private tenantRepository: Repository<Tenant>) {}
  async create(tenantPayload: TenantPayload) {
    const tenantRepo = await this.tenantRepository.save(tenantPayload)
    return tenantRepo
  }

  async getTenants(page: number, pageSize: number, searchQuery: string) {
    const queryBuilder = this.tenantRepository.createQueryBuilder('tenant')
    if (searchQuery && searchQuery.trim() !== '') {
      queryBuilder.where('tenant.name LIKE :searchQuery', {
        searchQuery: `%${searchQuery}%`,
      })
    }
    queryBuilder.skip((page - 1) * pageSize)
    queryBuilder.take(pageSize)
    const [tenants, total] = await queryBuilder.getManyAndCount()
    const totalCount = Math.ceil(total / pageSize)
    return [tenants, totalCount]
  }

  async getTenantById(id: string) {
    const tenant = await this.tenantRepository.findOne({ where: { id } })
    return tenant
  }

  async deleteTenantbyId(id: string) {
    const result = await this.tenantRepository.delete({ id })
    return result
  }

  async updateTenantById(id: string, name: string, address: string) {
    const tenant = await this.tenantRepository.findOne({ where: { id } })
    if (!tenant) {
      const error = createHttpError(400, 'tenant id not found')
      throw error
    }

    const upadte = await this.tenantRepository.update(id, { name, address })

    return upadte
  }
}
