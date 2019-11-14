const db = require('../utils/admin').db

exports.updateEmail = (req, res) => {
  const data = JSON.parse(req.body)

  const request = {
    newEmail: data.newEmail
  }

  const userId = req.userId
  const newEmail = request.newEmail

  db.collection('accounts')
    .doc(userId)
    .update({
      email: newEmail
    })
    .then(() => {
      // hit the ConvertKit api to update the record.
      // You need to get the subscriber Id from them

      return res.status(200).json({
        message: '👍 Email updated!'
      })
    })
    .catch(error => {
      return res.status(500).json({
        message: '😬 Oh no! Try again!',
        error
      })
    })
}
