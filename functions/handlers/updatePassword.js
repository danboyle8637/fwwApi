const auth = require('../utils/admin').auth
const { confirmPasswordsEqual } = require('../utils/formatValidate')

exports.updatePassword = (req, res) => {
  const data = JSON.parse(req.body)

  const request = {
    userId: data.userId,
    newPassword: data.newPassword,
    confirmPassword: data.confirmPassword
  }

  const userId = request.userId
  const newPassword = request.newPassword
  const confirmPassword = request.confirmPassword

  const passwordsEqual = confirmPasswordsEqual(newPassword, confirmPassword)

  if (!passwordsEqual) {
    return res.status(400).json({
      message: "😢 Passwords don't equal."
    })
  } else {
    auth
      .updateUser(userId, {
        password: newPassword
      })
      .then(() => {
        return res.status(200).json({
          message: '👍 Password updated!'
        })
      })
  }
}
