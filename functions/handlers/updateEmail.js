const db = require('../utils/admin').db
const auth = require('../utils/admin').auth

const fetch = require('node-fetch')

exports.updateEmail = (req, res) => {
  const data = JSON.parse(req.body)

  const request = {
    newEmail: data.newEmail
  }

  const userId = req.userId
  const newEmail = request.newEmail.toLowerCase()

  const ckApiSecret = process.env.CONVERT_KIT_SECRET
  const ckBaseUrl = process.env.CONVERT_KIT_BASE_ENDPOINT

  db.collection('accounts')
    .doc(userId)
    .get()
    .then(docSnapshot => {
      const data = docSnapshot.data()
      const oldEmail = data.email

      const updateAuthAccount = auth.updateUser(userId, {
        email: newEmail
      })

      const updateAccountDoc = db
        .collection('accounts')
        .doc(userId)
        .update({
          email: newEmail
        })

      Promise.all([updateAuthAccount, updateAccountDoc])
        .then(() => {
          const ckFindMemberUrl = `${ckBaseUrl}/subscribers?api_secret=${ckApiSecret}&email_address=${oldEmail}`

          fetch(ckFindMemberUrl, {
            method: 'GET'
          })
            .then(response => response.json())
            .then(subscriberData => {
              const subscriberId = subscriberData.subscribers[0].id

              const updateSubscriberUrl = `${ckBaseUrl}/subscribers/${subscriberId}`

              const updateBody = {
                api_secret: ckApiSecret,
                email_address: newEmail
              }

              fetch(updateSubscriberUrl, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateBody)
              })
                .then(response => response.json())
                .then(() => {
                  return res.status(200).json({
                    message: '👍 Email updated!'
                  })
                })
                .catch(() => {
                  return res.status(500).json({
                    message: '👍 Email updated!'
                  })
                })
            })
            .catch(() => {
              return res.status(500).json({
                message: '😭 Email not full updated.'
              })
            })
        })
        .catch(() => {
          return res.status(500).json({
            message: '😬 Oh no! Try again!'
          })
        })
    })
}
