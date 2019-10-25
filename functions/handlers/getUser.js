const db = require('../utils/admin').db

exports.getUser = (req, res) => {
  const data = JSON.parse(req.body)

  const userData = {
    userId: data.userId
  }

  const userId = userData.userId

  db.collection('users')
    .doc(userId)
    .get()
    .then(userDoc => {
      const userData = userDoc.data()

      return res.status(200).json({
        message: 'Successfully got user',
        firstName: userData.firstName,
        programs: userData.programs,
        photoUrl: userData.photoUrl
      })
    })
    .catch(error => {
      return res.status(404).json({
        message: 'User not found.',
        error: error
      })
    })
}
