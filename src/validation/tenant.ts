import { checkSchema } from 'express-validator'

const tenantSchema = checkSchema({
  name: {
    notEmpty: {
      errorMessage: 'tenant name is required!',
    },

    isString: {
      errorMessage: 'tenant name must be a string type',
    },

    trim: true,

    isLength: {
      options: { min: 2, max: 100 },
      errorMessage: 'tenant name should be between 2 to 100 characters',
    },
  },

  address: {
    notEmpty: {
      errorMessage: 'tenant address is required!',
    },

    isString: {
      errorMessage: 'tenant address must be a string type',
    },

    trim: true,

    isLength: {
      options: { min: 2, max: 250 },
      errorMessage: 'tenant name should be between 2 to 250 characters',
    },
  },
})

export default tenantSchema
