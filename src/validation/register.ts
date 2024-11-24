import { checkSchema } from 'express-validator'

const userRegistrationSchema = checkSchema({
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

  email: {
    notEmpty: {
      errorMessage: 'email is required!',
    },
    trim: true,
    isEmail: {
      errorMessage: 'please enter a valid email',
    },
  },

  password: {
    notEmpty: {
      errorMessage: 'password is required',
    },
    isStrongPassword: {
      errorMessage: 'enter a strong password',
    },
    isLength: {
      options: { min: 8, max: 72 },
      errorMessage:
        'Password cannot be less than 8 characters and can not be greater than 72 characters',
    },
  },
})

export default userRegistrationSchema
