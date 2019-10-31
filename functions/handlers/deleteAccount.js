const db = require('../utils/admin').db

exports.deleteAccount = (req, res) => {
  const userId = req.userId

  const userAccountDoc = db
    .collection('accounts')
    .doc(userId)
    .delete()

  const userDoc = db
    .collection('users')
    .doc(userId)
    .delete()

  Promise.all([userAccountDoc, userDoc])
    .then(() => {
      return res.status(200).json({
        message: '😢 Account Deleted'
      })
    })
    .catch(() => {
      return res.status(500).json({
        message: '😬 Server issue. Try again.'
      })
    })
}
