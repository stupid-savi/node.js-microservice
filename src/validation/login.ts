import { checkSchema } from 'express-validator'

const userLoginSchema = checkSchema({
  username: {
    notEmpty: {
      errorMessage: 'username is required!',
    },
  },

  password: {
    notEmpty: {
      errorMessage: 'password is required',
    },
  },
})

export default userLoginSchema
