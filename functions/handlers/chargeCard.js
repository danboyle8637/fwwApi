require('dotenv').config({
  path: `.env`
})
const db = require('../utils/admin').db
const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET)

exports.chargeCard = (req, res) => {
  const data = JSON.parse(req.body)

  const request = {
    firstName: data.firstName,
    programId: data.programId,
    amount: data.amount,
    token: data.token
  }

  const userId = 'eMQP8iUAVwWAK70xoL6ZYtTibeG2'
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
          // TODO Add the program to users program array... have email address.

          // * Step 1 - Have programId and email address

          // * Step 2 - Get users program array in a holding array

          // * Step 3 - Get the total workouts from the program

          // * Step 4 - Set data in user's program for percent complete

          // * Step 5 - Set up Convert Kit correctly

          // * Step 6 - Update program array in database and holding array to send back to client

          // * Step 7 - For practice, update Custom Claims

          // * Step 8 - Recreate the add Programs functionality into a separate function so you can reuse it.

          // * You need to send back updated purchased and not purchased programs arrays for client update.

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
