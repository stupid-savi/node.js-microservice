import express, { NextFunction, Request, Response } from 'express'
import { TenantController } from '../controllers/TenantController'
import logger from '../config/logger'
import { TenantService } from '../services/TenantService'
import { Tenant } from '../entity/Tenant'
import { AppDataSource } from '../config/data-source'
import tenantSchema from '../validation/tenant'
import authenticate from '../middlewares/authenticate'
import { canAccess } from '../middlewares/canAccess'
import { USER_ROLES } from '../constants'

const tenantRouter = express.Router()
const tenantRepository = AppDataSource.getRepository(Tenant)
const tenantService = new TenantService(tenantRepository)
const tenantController = new TenantController(logger, tenantService)

tenantRouter.post(
  '/',
  tenantSchema,
  authenticate,
  canAccess([USER_ROLES.ADMIN, USER_ROLES.CUSTOMER]),
  async (req: Request, res: Response, next: NextFunction) => {
    await tenantController.create(req, res, next)
  },
)

tenantRouter.get(
  '/tenant-list',
  authenticate,
  canAccess([USER_ROLES.ADMIN, USER_ROLES.CUSTOMER]),
  async (req: Request, res: Response, next: NextFunction) => {
    await tenantController.getTenantList(req, res, next)
  },
)

tenantRouter.get(
  '/:id',
  authenticate,
  canAccess([USER_ROLES.ADMIN, USER_ROLES.CUSTOMER]),
  async (req: Request, res: Response, next: NextFunction) => {
    await tenantController.getTenant(req, res, next)
  },
)

tenantRouter.delete(
  '/:id',
  authenticate,
  canAccess([USER_ROLES.ADMIN, USER_ROLES.CUSTOMER]),
  async (req: Request, res: Response, next: NextFunction) => {
    await tenantController.deleteTenant(req, res, next)
  },
)

tenantRouter.put(
  '/:id',
  tenantSchema,
  authenticate,
  canAccess([USER_ROLES.ADMIN, USER_ROLES.CUSTOMER]),
  async (req: Request, res: Response, next: NextFunction) => {
    await tenantController.updateTenant(req, res, next)
  },
)
export default tenantRouter
