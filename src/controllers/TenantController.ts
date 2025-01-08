import { NextFunction, Request, Response } from 'express'
import { Logger } from 'winston'
import { TenantService } from '../services/TenantService'
import { validationResult } from 'express-validator'
import { TenantRequest } from '../types'

export class TenantController {
  logger: Logger
  tenantService: TenantService
  constructor(logger: Logger, tenantService: TenantService) {
    this.logger = logger
    this.tenantService = tenantService
  }
  async create(req: TenantRequest, res: Response, next: NextFunction) {
    const { name, address } = req.body
    this.logger.debug('Request for debugging Tenant request body', {
      name,
      address,
    })
    try {
      const result = validationResult(req)
      if (!result.isEmpty()) {
        res.status(400).json({ errors: result.array() })
        return
      }
      const tenant = await this.tenantService.create({ name, address })
      this.logger.info('Tenant has been created', {
        id: tenant.id,
        name,
        address,
      })
      res.status(201).json({
        message: 'Tenant created Successfuly',
        name: tenant.name,
        address: tenant.address,
        id: tenant.id,
      })
      return
    } catch (error) {
      this.logger.error('error creating tenant', { name })
      next(error)
    }
  }

  async getTenantList(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, pageSize = 10, searchQuery = '' } = req.query || {}
      const [tenants, total] = await this.tenantService.getTenants(
        +page,
        +pageSize,
        searchQuery as string,
      )
      res
        .status(200)
        .json({
          message: 'fetch tenant list successfully',
          data: { tenants, total },
        })
      return
    } catch (error) {
      this.logger.error('Error getting tenant list', { data: req.query })
      next(error)
      return
    }
  }
}
