import express from 'express'

const app = express()

app.get('/', (_, res) => {
  res.status(200).json({ msg: 'Welcome to Pizza App' })
})

export default app
