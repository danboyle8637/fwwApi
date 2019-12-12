require('dotenv').config({
  path: `.env`
})
const db = require('../utils/admin').db
const sgMail = require('@sendgrid/mail')

exports.deleteAccount = (req, res) => {
  sgMail.setApiKey(process.env.SEND_GRID_KEY)

  const userId = req.userId

  db.collection('accounts')
    .doc(userId)
    .get()
    .then(docSnapshot => {
      const data = docSnapshot.data
      const firstName = data.firstName
      const email = data.email
      const adminSubject = `💔 Delete ${firstName}'s FWW Reset account`
      const userSubject = `💔 ${firstName}, your account is set to be deleted`

      const adminMessage = {
        to: 'kindal@fitwomensweekly.net',
        from: 'fww@fitwomensweekly.net',
        templateId: 'd-2717cb171d8e4a149dfe3b822a2c27f4',
        dynamic_template_data: {
          firstName: firstName,
          email: email,
          subject: adminSubject
        }
      }

      const userMessage = {
        to: email,
        from: 'kindal@fitwomensweekly.com',
        templateId: 'd-aca2d3781f3a4c9f9cde674acd33dcfe',
        dynamic_template_data: {
          subject: userSubject,
          firstName: firstName
        }
      }

      const admin = sgMail.send(adminMessage)
      const user = sgMail.send(userMessage)

      Promise.all([admin, user])
        .then(() => {
          res.status(200).json({
            message: 'Account set to be deleted 💔'
          })
        })
        .catch(() => {
          res.status(500).json({
            message: `Message didn't send 😬. Try again!`
          })
        })
    })
    .catch(() => {
      res.status(500).json({
        message: `Message didn't send 😬. Try again!`
      })
    })
}
