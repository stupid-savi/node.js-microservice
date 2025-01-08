import { Repository } from 'typeorm'
import { TenantPayload } from '../types'
import { Tenant } from '../entity/Tenant'

export class TenantService {
  constructor(private tenantRepository: Repository<Tenant>) {}
  async create(tenantPayload: TenantPayload) {
    const tenantRepo = await this.tenantRepository.save(tenantPayload)
    return tenantRepo
  }
}
