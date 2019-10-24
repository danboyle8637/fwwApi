const db = require('../utils/admin').db

exports.checkUsername = (req, res) => {
  const userInfo = {
    username: req.body.username
  }

  const usernameToCheck = userInfo.username.trim()

  db.collection('users')
    .get()
    .then(docsSnapshot => {
      let usernameArray = []

      docsSnapshot.forEach(doc => {
        const data = doc.data()
        usernameArray.push(data.username)
      })

      const foundUsername = usernameArray.filter(
        username => username === usernameToCheck
      )

      if (foundUsername.length > 0) {
        res.status(200).json({
          message: '😢 username taken',
          inputMessage: 'Taken. Try again.'
        })
      } else {
        res.status(200).json({
          message: "🙌 It's yours!",
          inputMessage: 'Username is yours!'
        })
      }
    })
    .catch(error => {
      res.status(400).json({
        message: 'Server error. Try again.',
        error: error
      })
    })
}
