import express from 'express'
import { HEALTH_CHECK_ENABLED } from './server'

const app = express()

app.use((req, res, next) => {
  console.log('middleware triggered')
  if (HEALTH_CHECK_ENABLED) {
    next()
  } else {
    res.status(503).send('Server shutting down')
    return
  }
})

app.get('/', (_, res) => {
  res.status(200).json({ msg: 'Welcome to Pizza App' })
  return
})

app.get('/long-response', (req, res) => {
  console.log('request')
  setTimeout(() => res.send('Finally! OK'), 7000)
  return
})

export default app
