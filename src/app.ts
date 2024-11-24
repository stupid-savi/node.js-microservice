import express, { NextFunction, Request, Response } from 'express'
import { HEALTH_CHECK_ENABLED } from './server'

import createHttpError, { HttpError } from 'http-errors'
import logger from './config/logger'
import authRouter from './routes/auth'
import 'reflect-metadata'

const app = express()

app.use(express.json())

app.use((req, res, next) => {
  console.log('middleware triggered')
  if (HEALTH_CHECK_ENABLED) {
    next()
  } else {
    res.status(503).send('Server shutting down')
    return
  }
})

// prefix route with auth
app.use('/auth', authRouter)

// Note :- If we throw any error in our any api route or function it get catched in the global error hanlder middleware. But in express below version 5 (fixed in version 5) if we throw error in a async function it won't get caught in the global error hanlder middle and app crashed so instead of throw use next(pass err here)

app.get('/', (_, res) => {
  const isLoggedIn = true
  if (!isLoggedIn) {
    const err = createHttpError(401, 'You are not authorised to access this')
    throw err
  }
  res.status(200).json({ msg: 'Welcome to Pizza App' })
  return
})

// eslint-disable-next-line @typescript-eslint/require-await
app.get('/long-response', async (req, res, next) => {
  const isLoggedIn = false

  if (!isLoggedIn) {
    const err = createHttpError(401, 'You are not authorised to access this')
    // SUPER IMPORTANT POINT TO NOTE :- ADDED COMMENT ABOVE
    next(err)
    return
  }
  console.log('request')
  setTimeout(() => res.send('Finally! OK'), 7000)
  return
})

// Global error handling middleware for all erros like 500, 400, 401
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
app.use((error: HttpError, req: Request, res: Response, next: NextFunction) => {
  const requestPath = req.path
  const statusCode = error.statusCode || 500
  logger.error(error.message, {
    statusCode,
    path: requestPath,
    type: error.name,
  })

  console.log(statusCode, requestPath, error.name)

  res.status(statusCode).json({
    errors: [
      {
        type: error.name,
        msg: error.message,
        path: requestPath,
        location: '',
      },
    ],
  })
})

export default app
