import request from 'supertest'
import app from '../../src/app'
import { User } from '../../src/entity/User'
import { AppDataSource } from '../../src/config/data-source'
import { DataSource } from 'typeorm'
import { truncateTables } from '../utils'
import { response } from 'express'

describe('POST auth/register', () => {
  let connection: DataSource

  jest.setTimeout(15000) // 15 seconds for all tests in this block

  // Database tear down before running tests and after running all test

  beforeAll(async () => {
    connection = await AppDataSource.initialize()
  })

  beforeEach(async () => {
    // with each test truncate the db so no conflicts appears in db due other tests
    await truncateTables(connection)
  })

  afterAll(async () => {
    await connection.destroy()
  })

  // Test cases can be of two types 1.Happy Path 2. Sad Path
  // Happy paths are the test cases which fulfills all the required conditions/payload, which means when everything is ok what should be the response

  describe('Given all fields', () => {
    it('Should return 201 status code', async () => {
      // use AAA rule
      // Arrange -  Prepare the data like payload or fields
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'jjdsjd8878',
      }

      // Act -  Trigger the actual logic like call the api endpoint

      const response = await request(app as any)
        .post('/auth/register')
        .send(userData)

      // Assert - Match the expected out i.e check whether it return 201 status code or not

      expect(response.statusCode).toBe(201)
    })

    it('Should return valid JSON response', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'jjdsjd8878',
      }

      const response = await request(app as any)
        .post('/auth/register')
        .send(userData)

      expect(
        (response.headers as Record<string, string>)['content-type'],
      ).toEqual(expect.stringContaining('json'))
    })

    it('Should persist user in the database', async () => {
      // Arrange
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'jjdsjd8878',
      }

      // Act
      await request(app as any)
        .post('/auth/register')
        .send(userData)

      // Assert

      const userRepository = connection.getRepository(User)
      const user = await userRepository.find()
      expect(user).toHaveLength(1)
      expect(user[0].firstname).toBe(userData.firstname)
      expect(user[0].lastname).toBe(userData.lastname)
      expect(user[0].email).toBe(userData.email)
    })

    it('Should return id of created user', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'jjdsjd8878',
      }

      const response = await request(app as any)
        .post('/auth/register')
        .send(userData)

      expect(response.body).toHaveProperty('id')
      expect(response.body.id).toBeGreaterThan(0)
    })
  })

  // Sad paths are test cases when spme fields or payloads are missing which didn't make the output Okay

  describe('Fields are missing', () => {
    it('should return 400 for invalid payload', async () => {
      const response = await request(app as any)
        .post('/auth/register')
        .send()
      expect(response.status).toBe(400)
      expect(
        (response.headers as Record<string, string>)['content-type'],
      ).toEqual(expect.stringContaining('json'))
    })
  })
})
