const db = require('../utils/admin').db
const auth = require('../utils/admin').auth

exports.getUser = (req, res) => {
  const userId = req.userId

  db.collection('users')
    .doc(userId)
    .get()
    .then(docSnapshot => {
      const userExists = docSnapshot.exists

      if (userExists) {
        const userData = docSnapshot.data()

        return res.status(200).json({
          message: 'Successfully got user',
          error: false,
          firstName: userData.firstName,
          programs: userData.programs
        })
      } else {
        auth.deleteUser(userId)
        return res.status(404).json({
          message: `User not found. Please sign up and create an account. It's free!`,
          error: true
        })
      }
    })
    .catch(error => {
      return res.status(500).json({
        message: `User not found. Are you sure you're a member? If not go sign up. It's free!`,
        error: error
      })
    })
}
