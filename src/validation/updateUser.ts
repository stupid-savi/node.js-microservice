import { checkSchema } from 'express-validator'
import { USER_ROLES } from '../constants'

const userUpadteSchema = checkSchema({
  firstname: {
    notEmpty: {
      errorMessage: 'firstname is required!',
    },

    isString: {
      errorMessage: 'firstname must be a string type',
    },

    trim: true,

    isLength: {
      options: { min: 3, max: 50 },
      errorMessage: 'firstname should be between 3 to 50 characters',
    },
  },

  lastname: {
    notEmpty: {
      errorMessage: 'lastname is required!',
    },

    isString: {
      errorMessage: 'lastname must be a string type',
    },

    trim: true,

    isLength: {
      options: { min: 3, max: 50 },
      errorMessage: 'lastname should be between 3 to 50 characters',
    },
  },

  role: {
    notEmpty: {
      errorMessage: 'Role is required!',
    },
    isString: {
      errorMessage: 'Role must be a string type',
    },
    trim: true,
    isIn: {
      options: [Object.values(USER_ROLES)],
      errorMessage: `Role must be one of the following: ${Object.values(USER_ROLES).join(', ')}`,
    },
  },

  tenantId: {
    optional: { options: { nullable: true } },

    isUUID: {
      errorMessage: 'Invalid Tenant id format!',
    },
    trim: true,
  },
})

export default userUpadteSchema
