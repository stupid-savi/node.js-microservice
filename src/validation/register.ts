import { checkSchema } from 'express-validator'

const userRegistrationSchema = checkSchema({
  firstname: {
    notEmpty: {
      errorMessage: 'firstname is required!',
    },

    isString: {
      errorMessage: 'firstname must be a string type',
    },

    isLength: {
      options: { min: 3, max: 50 },
      errorMessage: 'firstname should be between 3 to 50 characters',
    },

    trim: true,
  },

  lastname: {
    notEmpty: {
      errorMessage: 'lastname is required!',
    },

    isString: {
      errorMessage: 'lastname must be a string type',
    },

    isLength: {
      options: { min: 3, max: 50 },
      errorMessage: 'lastname should be between 3 to 50 characters',
    },

    trim: true,
  },

  email: {
    notEmpty: {
      errorMessage: 'email is required!',
    },
    isEmail: {
      errorMessage: 'please enter a valid email',
    },

    trim: true,
  },

  password: {
    notEmpty: {
      errorMessage: 'password is required',
    },
    isStrongPassword: {
      errorMessage: 'enter a strong password',
    },
    isLength: {
      options: { max: 72 },
      errorMessage: 'Password cannot be greater than 72 characters',
    },
  },
})

export default userRegistrationSchema
