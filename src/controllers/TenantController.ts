import { NextFunction, Request, Response } from 'express'
import { Logger } from 'winston'
import { TenantService } from '../services/TenantService'
import { validationResult } from 'express-validator'

export class TenantController {
  logger: Logger
  tenantService: TenantService
  constructor(logger: Logger, tenantService: TenantService) {
    this.logger = logger
    this.tenantService = tenantService
  }
  async create(req: Request, res: Response, next: NextFunction) {
    const { name, address } = req.body
    try {
      const result = validationResult(req)
      if (!result.isEmpty()) {
        res.status(400).json({ errors: result.array() })
        return
      }
      const tenant = await this.tenantService.create({ name, address })
      res
        .status(201)
        .json({
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
}
