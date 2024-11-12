import app from './app'
import { discountedPrice } from './utils'
import request from 'supertest'

describe('App', () => {
  it('should return discounted amount', () => {
    const discountPrice = discountedPrice(1000, 20)
    expect(discountPrice).toBe(200)
  })
  it('should throw an error for invalid parameters', () => {
    expect(() => discountedPrice(0, -700)).toThrow('Invalid parameters')
  })

  it('should return status code 200', async () => {
    const response = await request(app).get('/').send()
    expect(response.statusCode).toBe(200)
  })
})
