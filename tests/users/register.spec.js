'use strict'
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value)
          })
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const supertest_1 = __importDefault(require('supertest'))
const app_1 = __importDefault(require('../../src/app'))
describe('POST auth/register', () => {
  jest.setTimeout(15000) // 15 seconds for all tests in this block
  // Test cases can be of two types 1.Happy Path 2. Sad Path
  // Happy paths are the test cases which fulfills all the required conditions/payload, which means when everything is ok what should be the response
  describe('Given all fields', () => {
    it('Should return 201 status code', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        // use AAA rule
        // Arrange -  Prepare the data like payload or fields
        const userData = {
          firstname: 'Savi',
          lastname: 'Singh',
          email: '1@gmail.com',
          password: 'jjdsjd8878',
        }
        // Act -  Trigger the actual logic like call the api endpoint
        const response = yield (0, supertest_1.default)(app_1.default)
          .post('/auth/register')
          .send(userData)
        // Assert - Match the expected out i.e check whether it return 201 status code or not
        expect(response.statusCode).toBe(201)
      }))
    it('Should return valid JSON response', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        const userData = {
          firstname: 'Savi',
          lastname: 'Singh',
          email: '1@gmail.com',
          password: 'jjdsjd8878',
        }
        const response = yield (0, supertest_1.default)(app_1.default)
          .post('/auth/register')
          .send(userData)
        expect(response.headers['content-type']).toEqual(
          expect.stringContaining('json'),
        )
      }))
  })
  // Sad paths are test cases when spme fields or payloads are missing which didn't make the output Okay
  describe('Fields are missing', () => {
    it('should return 400 for invalid payload', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default)
          .post('/auth/register')
          .send()
        expect(response.status).toBe(400)
        expect(response.headers['content-type']).toEqual(
          expect.stringContaining('json'),
        )
      }))
  })
})
