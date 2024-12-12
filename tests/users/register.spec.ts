import request from 'supertest'
import app from '../../src/app'
import { User } from '../../src/entity/User'
import { AppDataSource } from '../../src/config/data-source'
import { DataSource } from 'typeorm'
import { truncateTables } from '../utils'
import { response } from 'express'
import { USER_ROLES } from '../../src/constants'

describe('POST auth/register', () => {
  let connection: DataSource

  // jest.setTimeout(20000) // 15 seconds for all tests in this block

  // Database tear down before running tests and after running all test

  beforeAll(async () => {
    connection = await AppDataSource.initialize()
  })

  beforeEach(async () => {
    // with each test truncate the db so no conflicts appears in db due other tests
    // await truncateTables(connection)
    // for synchronisation
    await connection.dropDatabase()
    await connection.synchronize()
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
        password: 'Test@9767$%13456',
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
        password: 'Test@9767$%13456',
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
        password: 'Test@9767$%13456',
      }

      // Act
      await request(app as any)
        .post('/auth/register')
        .send(userData)

      // Assert

      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users).toHaveLength(1)
      expect(users[0].firstname).toBe(userData.firstname)
      expect(users[0].lastname).toBe(userData.lastname)
      expect(users[0].email).toBe(userData.email)
    })

    it('Should return id of created user', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
      }

      const response = await request(app as any)
        .post('/auth/register')
        .send(userData)
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          response.body.id,
        )

      expect(response.body).toHaveProperty('id')
      expect(isUUID).toBe(true)
    })

    it('Should contain role customer', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
      }

      await request(app as any)
        .post('/auth/register')
        .send(userData)

      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users[0]).toHaveProperty('role')
      expect(users[0].role).toBe(USER_ROLES.CUSTOMER)
    })

    it('Should contain a hashed password', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
      }

      await request(app).post('/auth/register').send(userData)

      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()

      expect(users[0].password).not.toBe(userData.password)
      expect(users[0].password).toHaveLength(60)
      expect(users[0].password).toMatch(/^\$2b\$\d+\$/)
    })

    it('Should not have password more than 72 characters', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456'.repeat(7),
      }

      const response = await request(app as any)
        .post('/auth/register')
        .send(userData)
      expect(response.status).toBe(400)
      expect(
        (response.headers as Record<string, string>)['content-type'],
      ).toEqual(expect.stringContaining('json'))
    })

    it('Should return status 400 for duplicate email entry in db', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
        role: USER_ROLES.CUSTOMER,
      }

      const userRepository = connection.getRepository(User)
      await userRepository.save(userData)
      const response = await request(app).post('/auth/register').send(userData)
      const users = await userRepository.find()

      expect(response.status).toBe(400)
      expect(users).toHaveLength(1)
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

    it('should return status code 400 if email is missing', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        password: 'Test@9767$%13456',
        role: USER_ROLES.CUSTOMER,
      }

      const response = await request(app).post('/auth/register').send(userData)

      expect(response.status).toBe(400)

      expect(response.body.errors).toBeInstanceOf(Array)

      expect(response.body.errors[0]).toHaveProperty('type')
      expect(response.body.errors[0]).toHaveProperty(
        'msg',
        'email is required!',
      )
      expect(response.body.errors[0]).toHaveProperty('path')
      expect(response.body.errors[0]).toHaveProperty('location')
    })

    it('should return status code 400 if firstname is missing', async () => {
      const userData = {
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
        role: USER_ROLES.CUSTOMER,
      }

      const response = await request(app).post('/auth/register').send(userData)

      expect(response.status).toBe(400)
      expect(response.body.errors[0]).toHaveProperty('type')
      expect(response.body.errors[0]).toHaveProperty(
        'msg',
        'firstname is required!',
      )
      expect(response.body.errors[0]).toHaveProperty('path')
      expect(response.body.errors[0]).toHaveProperty('location')
    })

    it('should return status code 400 if lastname is missing', async () => {
      const userData = {
        firstname: 'Savi',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
        role: USER_ROLES.CUSTOMER,
      }

      const response = await request(app).post('/auth/register').send(userData)

      expect(response.status).toBe(400)
      expect(response.body.errors[0]).toHaveProperty('type')
      expect(response.body.errors[0]).toHaveProperty(
        'msg',
        'lastname is required!',
      )
      expect(response.body.errors[0]).toHaveProperty('path')
      expect(response.body.errors[0]).toHaveProperty('location')
    })

    it('should return status code 400 if password is missing', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        role: USER_ROLES.CUSTOMER,
      }

      const response = await request(app).post('/auth/register').send(userData)

      expect(response.status).toBe(400)
      expect(response.body.errors[0]).toHaveProperty('type')
      expect(response.body.errors[0]).toHaveProperty('msg')
      expect(response.body.errors[0]).toHaveProperty('path')
      expect(response.body.errors[0]).toHaveProperty('location')
    })
  })

  describe('Fields are not in proper format', () => {
    it('Should trime email field', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: ' 1@gmail.com ',
        password: 'Test@9767$%13456',
        role: USER_ROLES.CUSTOMER,
      }

      await request(app).post('/auth/register').send(userData)
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      const user = users[0]

      expect(user.email).toBe('1@gmail.com')
    })

    it('Should trim firstname field', async () => {
      const userData = {
        firstname: ' Savi ',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
        role: USER_ROLES.CUSTOMER,
      }

      await request(app).post('/auth/register').send(userData)

      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      const user = users[0]

      expect(user.firstname).toBe('Savi')
    })
    it('Should trim lastname field', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: ' Singh ',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
        role: USER_ROLES.CUSTOMER,
      }

      await request(app).post('/auth/register').send(userData)

      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      const user = users[0]

      expect(user.lastname).toBe('Singh')
    })
    it('Password should have atleast 8 characters', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@$6',
        role: USER_ROLES.CUSTOMER,
      }

      const response = await request(app).post('/auth/register').send(userData)

      expect(response.status).toBe(400)
    })
  })
})
