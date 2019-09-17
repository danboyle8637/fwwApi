const db = require('../utils/admin').db

exports.getUser = (req, res) => {
  const data = JSON.parse(req.body)

  const userData = {
    username: data.username
  }

  db.collection('users')
    .doc(userData.username)
    .get()
    .then(userDoc => {
      const userData = userDoc.data()

      return res.status(200).json({
        message: 'Successfully got user',
        firstName: userData.firstName,
        username: userData.username,
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
