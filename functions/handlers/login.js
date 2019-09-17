// Should not need this route. Let Auth do that on the frontend.

const { checkIsEmail, checkIsEmpty } = require('../utils/formatValidate')

exports.login = (req, res) => {
  const loginDetails = {
    email: req.body.email,
    password: req.body.password
  }

  // Validate and clean user data
  let errors = {}
  const isEmail = checkIsEmail(loginDetails.email)
  const isEmailEmpty = checkIsEmpty(loginDetails.email)
  const isPasswordEmpty = checkIsEmpty(loginDetails.password)

  if (!isEmail) {
    errors.email = 'Make sure your email is valid'
  }

  if (isEmailEmpty) {
    errors.emailEmpty = 'Please enter your email address'
  }

  if (isPasswordEmpty) {
    errors.passwordEmpty = 'Please enter your password'
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors })
  }

  return res
    .status(200)
    .json({ message: 'Login details look good.', login: true })
}
