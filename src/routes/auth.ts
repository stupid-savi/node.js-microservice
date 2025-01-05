import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express'
import { AuthController } from '../controllers/AuthController'
import { UserService } from '../services/UserService'
import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'
import logger from '../config/logger'
import userRegistrationSchema from '../validation/register'
import { TokenService } from '../services/TokenService'
import { RefreshToken } from '../entity/RefreshToken'
import userLoginSchema from '../validation/login'
import { CredentialService } from '../services/CredentialService'
import { RequestAuth } from '../types'
import authenticate from '../middlewares/authenticate'
import validateRefresh from '../middlewares/validateRefresh'
import parsedRefreshToken from '../middlewares/parsedRefreshToken'

// Note:-  Inversify.js can automate below process
const authRouter = express.Router()
const userRepository = AppDataSource.getRepository(User)
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken)
const userService = new UserService(userRepository)
const tokenService = new TokenService(refreshTokenRepository)
const credentialService = new CredentialService()
const authController = new AuthController(
  userService,
  logger,
  tokenService,
  credentialService,
)

// Can use any of both options for binding of this keyword
// authRouter.post('/register', authController.register.bind(authController))
authRouter.post(
  '/register',
  userRegistrationSchema,
  async (req: Request, res: Response, next: NextFunction) => {
    await authController.register(req, res, next)
  },
)

authRouter.post(
  '/login',
  userLoginSchema,
  async (req: Request, res: Response, next: NextFunction) => {
    await authController.login(req, res, next)
  },
)

authRouter.get(
  '/self',
  authenticate as RequestHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    await authController.self(req as RequestAuth, res, next)
  },
)

authRouter.post(
  '/refresh',
  validateRefresh as RequestHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    await authController.refresh(req as RequestAuth, res, next)
  },
)

authRouter.post(
  '/logout',
  authenticate as RequestHandler,
  parsedRefreshToken,
  async (req: Request, res: Response, next: NextFunction) => {
    await authController.logout(req as RequestAuth, res, next)
  },
)

export default authRouter
