import { NextFunction, Request, Response } from 'express'
import { Logger } from 'winston'
import { TenantService } from '../services/TenantService'
import { validationResult } from 'express-validator'
import { TenantRequest } from '../types'
import createHttpError from 'http-errors'

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

      const _page = +page
      const _pageSize = +pageSize
      const [tenants, total] = await this.tenantService.getTenants(
        _page,
        _pageSize,
        searchQuery as string,
      )
      res.status(200).json({
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
  async getTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      if (!id) {
        const error = createHttpError(400, 'Tenant Id is missing')
        next(error)
        return
      }

      const tenant = await this.tenantService.getTenantById(id)

      if (!tenant) {
        const error = createHttpError(400, 'Tenant not found')
        throw error
      }

      res.status(200).json({
        message: 'fetch tenant successfully',
        data: tenant,
      })

      return
    } catch (error) {
      this.logger.error('Error getting the tenant', { id: req.params })
      next(error)
    }
  }

  async deleteTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      if (!id) {
        const error = createHttpError(400, 'Tenant Id is missing')
        next(error)
        return
      }

      const result = await this.tenantService.deleteTenantbyId(id)

      if (result.affected === 0) {
        const error = createHttpError(400, 'tenant id not found')
        throw error
      }

      res.status(200).json({ message: 'Tenant deleted successfully' })
      return
    } catch (error) {
      this.logger.error('Error deleting the tenant', { id: req.params })
      next(error)
    }
  }

  async updateTenant(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { name, address } = req.body

      this.logger.debug('Request for debugging Tenant request body', {
        name,
        address,
      })

      const result = validationResult(req)
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() })
      }

      const { id } = req.params
      if (!id) {
        const error = createHttpError(400, 'Tenant Id is missing')
        return next(error)
      }

      const updateResult = await this.tenantService.updateTenantById(
        id,
        name,
        address,
      )
      if (updateResult.affected === 0) {
        const error = createHttpError(400, 'Error updating the Tenant')
        return next(error)
      }

      res.json({ message: 'Tenant updated successfully' })
    } catch (error) {
      this.logger.error('Error updating the tenant', { id: req.params })
      next(error)
    }
  }
}
