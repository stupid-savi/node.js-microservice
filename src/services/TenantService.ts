import { Repository } from 'typeorm'
import { TenantRequestPayload } from '../types'
import { Tenant } from '../entity/Tenant'

export class TenantService {
  constructor(private tenantRepository: Repository<Tenant>) {}
  async create({ name, address }: TenantRequestPayload) {
    const tenantRepo = await this.tenantRepository.save({ name, address })
    return tenantRepo
  }
}
