const db = require('../utils/admin').db

exports.isInFirestore = userId => {
  return new Promise((resolve, reject) => {
    db.collection('users')
      .doc(userId)
      .get()
      .then(docSnapshot => {
        const userDocExists = docSnapshot.exists
        resolve(userDocExists)
      })
      .catch(error => {
        reject(error)
      })
  })
}
