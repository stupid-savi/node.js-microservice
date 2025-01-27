import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { Tenant } from '../../src/entity/Tenant'
import request from 'supertest'
import app from '../../src/app'
import createJWKSMock from 'mock-jwks'
import { USER_ROLES } from '../../src/constants'
import { User } from '../../src/entity/User'

describe('POST /users', () => {
  let connection: DataSource
  let jwks: ReturnType<typeof createJWKSMock>
  let adminAccessToken: string

  beforeAll(async () => {
    jwks = createJWKSMock('http://localhost:8085')
    connection = await AppDataSource.initialize()
  })

  beforeEach(async () => {
    await connection.dropDatabase()
    await connection.synchronize()
    jwks.start()
    adminAccessToken = jwks.token({ sub: '1', role: USER_ROLES.ADMIN })
  })

  afterEach(() => {
    jwks.stop()
  })

  afterAll(async () => {
    await connection.destroy()
  })

  describe('Given all fields', () => {
    it('should return status code 201 in response', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
        role: USER_ROLES.MANAGER,
      }
      const response = await request(app)
        .post('/user')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(userData)
      expect(response.statusCode).toBe(201)
    })

    it('should persist user in the db ', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
        role: USER_ROLES.MANAGER,
      }
      await request(app)
        .post('/user')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(userData)

      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users[0].firstname).toEqual(userData.firstname)
      expect(users[0].lastname).toEqual(userData.lastname)
      expect(users[0].email).toEqual(userData.email)
    })

    it('should persist only manager user in the DB ', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
      }
      await request(app)
        .post('/user')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(userData)

      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users[0].role).toEqual(USER_ROLES.MANAGER)
    })

    it('Should contain a hashed password', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: '1@gmail.com',
        password: 'Test@9767$%13456',
      }

      await request(app)
        .post('/user')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(userData)

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

      const response = await request(app)
        .post('/user')
        .set('Cookie', `accessToken=${adminAccessToken};`)
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
        role: USER_ROLES.MANAGER,
      }

      const userRepository = connection.getRepository(User)
      await userRepository.save(userData)
      const response = await request(app)
        .post('/user')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(userData)
      const users = await userRepository.find()
      expect(response.status).toBe(400)
      expect(users).toHaveLength(1)
    })
  })

  describe('Fields are missing', () => {
    it('should return 400 for invalid payload', async () => {
      const response = await request(app)
        .post('/user')
        .set('Cookie', `accessToken=${adminAccessToken};`)
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
        role: USER_ROLES.MANAGER,
      }

      const response = await request(app)
        .post('/user')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(userData)

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
        role: USER_ROLES.MANAGER,
      }

      const response = await request(app)
        .post('/user')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(userData)

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
        role: USER_ROLES.MANAGER,
      }

      const response = await request(app)
        .post('/user')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(userData)

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
        role: USER_ROLES.MANAGER,
      }

      const response = await request(app)
        .post('/user')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(userData)

      expect(response.status).toBe(400)
      expect(response.body.errors[0]).toHaveProperty('type')
      expect(response.body.errors[0]).toHaveProperty('msg')
      expect(response.body.errors[0]).toHaveProperty('path')
      expect(response.body.errors[0]).toHaveProperty('location')
    })
  })

  describe('Fields are not in proper format', () => {
    it('Should trim email field', async () => {
      const userData = {
        firstname: 'Savi',
        lastname: 'Singh',
        email: ' 1@gmail.com ',
        password: 'Test@9767$%13456',
        role: USER_ROLES.MANAGER,
      }

      await request(app)
        .post('/user')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(userData)
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
        role: USER_ROLES.MANAGER,
      }

      await request(app)
        .post('/user')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(userData)
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
        role: USER_ROLES.MANAGER,
      }

      await request(app)
        .post('/user')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(userData)
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
        role: USER_ROLES.MANAGER,
      }

      const response = await request(app)
        .post('/user')
        .set('Cookie', `accessToken=${adminAccessToken};`)
        .send(userData)

      expect(response.status).toBe(400)
    })
  })
})
