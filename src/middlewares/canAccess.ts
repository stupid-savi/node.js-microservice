import { NextFunction, Response, Request } from 'express'
import createHttpError from 'http-errors'
import { RequestAuth } from '../types'

export const canAccess = (roles = [] as string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const _req = req as RequestAuth
    const role = _req.auth.role

    if (!roles.includes(role)) {
      const error = createHttpError(
        403,
        "you don't have permissions to access the resource",
      )
      next(error)
      return
    }
    next()
  }
}
