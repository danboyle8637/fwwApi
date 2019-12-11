const { isInFirestore } = require('../helperFunctions/isInFirestore')
const { isInConvertKit } = require('../helperFunctions/isInConvertKit')
const {
  emergencyConvertKitSignUp
} = require('../helperFunctions/emergencyConvertKitSignUp')
const {
  emergencyFirestoreSignUp
} = require('../helperFunctions/emergencyFirestoreSignUp')
const { checkIsEmail, formatNames } = require('../utils/formatValidate')

exports.emergencyCompleteSignUp = (req, res) => {
  const data = JSON.parse(req.body)

  const request = {
    userId: data.userId,
    programId: data.programId,
    totalWorkouts: data.totalWorkouts,
    firstName: data.firstName,
    password: data.password,
    confirmPassword: data.confirmPassword,
    email: data.email,
    biggestObstacle: data.biggestObstacle
  }

  const userId = request.userId
  const programId = request.programId
  const totalWorkouts = request.totalWorkouts
  const firstName = request.firstName
  const password = request.password
  const confirmPassword = request.confirmPassword
  const email = request.email
  const biggestObstacle = request.biggestObstacle

  // Format the data so it gets set correctly
  const isEmail = checkIsEmail(email)
  const formattedEmail = email.toLowerCase()
  const formattedFirstName = formatNames(firstName)

  if (!isEmail) {
    // email address not valid. Send back. Should not happen.
    res.status(400).json({
      message:
        'Your email address is not passing validation checks. Please contact us with the email you used to sign up so we can help get your account set up correctly.'
    })
  }

  const cleanUserData = {
    userId: userId,
    programId: programId,
    totalWorkouts: totalWorkouts,
    firstName: formattedFirstName,
    password: password,
    confirmPassword: confirmPassword,
    email: formattedEmail,
    biggestObstacle: biggestObstacle
  }

  // Step 2: Find out which fetch call failed... signup endpoint or convertKit

  const inFirestore = isInFirestore(userId)
  const inConvertKit = isInConvertKit(email)

  Promise.all([inFirestore, inConvertKit])
    .then(dataArray => {
      const inFirestore = dataArray[0]
      const inConvertKit = dataArray[1]

      console.log(inFirestore)
      console.log(inConvertKit)

      // Both fail
      if (!inFirestore && !inConvertKit) {
        emergencyFirestoreSignUp(cleanUserData)
          .then(result => {
            if (result.status === 200) {
              emergencyConvertKitSignUp(cleanUserData)
                .then(() => {
                  res.status(200).json({
                    message: 'Account created!'
                  })
                })
                .catch(error => {
                  res.status(500).json({
                    message: `Could not get you signed up to our member email list. Don't miss out on member updates and specials. Email us so we can make sure you are set up correctly.`,
                    error: error.message
                  })
                })
            }
          })
          .catch(error => {
            res.status(500).json({
              message:
                'There was an error getting your account created. Please contact us so we can help make sure you are set up correctly. Sorry for the issue.',
              error: error
            })
          })
      } else if (inFirestore && !inConvertKit) {
        emergencyConvertKitSignUp(cleanUserData)
          .then(() => {
            res.status(200).json({
              message: 'Account added!'
            })
          })
          .catch(error => {
            res.status(500).json({
              message: `Could not get you signed up to our member email list. Don't miss out on member updates and specials. Email us so we can make sure you are set up correctly.`,
              error: error.message
            })
          })
      } else if (!inFirestore && inConvertKit) {
        emergencyFirestoreSignUp(cleanUserData)
          .then(() => {
            res.status(200).json({
              message: 'Account setup in database!'
            })
          })
          .catch(() => {
            res.status(500).json({
              message:
                'There was an error getting your account created. Please contact us so we can help make sure you are set up correctly. Sorry for the issue.'
            })
          })
      } else {
        res.status(400).json({
          message:
            'You should never be reading this message. If you are, please contact us immediately!'
        })
      }
    })
    .catch(() => {
      res.status(500).json({
        message: `Network issues kept us from setting up your account correctly. Contact us and we'll help you get setup so you can workout!`
      })
    })
}
