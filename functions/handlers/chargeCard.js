require('dotenv').config({
  path: `.env`
})
const db = require('../utils/admin').db
const stripe = require('stripe')(process.env.STRIPE_LIVE_SECRET)

exports.chargeCard = (req, res) => {
  const data = JSON.parse(req.body)

  const request = {
    firstName: data.firstName,
    programId: data.programId,
    amount: data.amount,
    token: data.token
  }

  const userId = req.userId
  const firstName = request.firstName
  const programId = request.programId
  const amount = request.amount * 100
  const description = `A charge of $${amount /
    100} was created because ${firstName} successfully purchased ${programId}.`
  const token = request.token

  db.collection('accounts')
    .doc(userId)
    .get()
    .then(docSnapshot => {
      const email = docSnapshot.data().email

      stripe.charges
        .create({
          amount: amount,
          currency: 'usd',
          source: token,
          description: description,
          receipt_email: email,
          metadata: {
            firstName: firstName,
            programId: programId
          }
        })
        .then(status => {
          res.status(200).json({
            message: status
          })
        })
        .catch(error => {
          res.status(500).json({
            message: error
          })
        })
    })
    .catch(error => {
      res.status(500).json({
        message:
          'Could not access your FWW account to complete your purchase. Try again!',
        error
      })
    })
}
