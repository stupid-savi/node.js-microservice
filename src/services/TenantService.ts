import { Repository } from 'typeorm'
import { TenantPayload } from '../types'
import { Tenant } from '../entity/Tenant'
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
}
