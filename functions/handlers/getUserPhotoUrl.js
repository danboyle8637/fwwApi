const auth = require('../utils/admin').auth

exports.getUserPhotoUrl = (req, res) => {
  const userId = req.userId

  auth
    .getUser(userId)
    .then(user => {
      return res.status(200).json({
        photoUrl: user.photoURL
      })
    })
    .catch(() => {
      return res.status(500).json({
        message: `Couldn't get your account.`
      })
    })
}
