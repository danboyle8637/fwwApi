/*
This endpoint will take a signed in user and if they had an error when they signed
so that their account was created but none of their data was setup in the database...

This endpoint will check if they have a doc... and if not it will set them up correctly.
*/
const db = require('../utils/admin').db
const fetch = require('node-fetch')

const { isInFirestore } = require('../helperFunctions/isInFirestore')
const { isInConvertKit } = require('../helperFunctions/isInConvertKit')
const { checkIsEmail, formatNames } = require('../utils/formatValidate')

exports.emergencyCompleteSignUp = (req, res) => {
  // Step 1: Get the userId
  const request = {
    userId: req.body.userId,
    programId: req.body.programId,
    totalWorkouts: req.body.totalWorkouts,
    firstName: req.body.firstName,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    email: req.body.email,
    biggestObstacle: req.body.biggestObstacle
  }

  const userId = request.userId
  const firstName = request.firstName
  const email = request.email
  const biggestObstacle = request.biggestObstacle

  const ckApiSecret = process.env.CONVERT_KIT_SECRET
  const ckApiKey = process.env.CONVERT_KIT_KEY
  const ckBaseUrl = process.env.CONVERT_KIT_BASE_ENDPOINT
  const ckFindMemberUrl = `${ckBaseUrl}/subscribers?api_secret=${ckApiSecret}&email_address=${email}`
  const ckListTagsUrl = `${ckBaseUrl}/tags?api_key=${ckApiKey}`

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

  const ckReqBody = {
    api_key: ckApiKey,
    first_name: formattedFirstName,
    email: formattedEmail,
    fields: {
      biggest_obstacle: biggestObstacle
    }
  }

  // Step 2: Find out which fetch call failed... signup endpoint or convertKit

  const inFirestore = isInFirestore(userId)
  const inConvertKit = isInConvertKit(email)

  Promise.all([inFirestore, inConvertKit])
    .then(dataArray => {
      const inFirestore = dataArray[0]
      const inConvertKit = dataArray[1]

      console.log(`Firestore: ${inFirestore}`)
      console.log(`ConvertKit: ${inConvertKit}`)
    })
    .catch(error => {
      console.log(error)
    })

  // 1) Check if the userDoc exists
  // db.collection('users')
  //   .doc(userId)
  //   .get()
  //   .then(docSnapshot => {
  //     const userDocExists = docSnapshot.exists
  //     const userData = docSnapshot.data()
  //     const program = userData.programs[0]

  //     if (userDocExists) {
  //       // 2) check convertKit
  //       fetch(ckFindMemberUrl, {
  //         method: 'GET'
  //       })
  //         .then(response => response.json())
  //         .then(subscriberData => {
  //           if (subscriberData.total_subscribers > 0) {
  //             // This should NEVER happen
  //             res.status(400).json({
  //               message:
  //                 'Something went wrong. Contact us with the email address you used to sign up so we can help get your account set up correctly.'
  //             })
  //           } else {
  //             // add them to ConvertKit with the right tag
  //             fetch(ckListTagsUrl, {
  //               method: 'GET'
  //             })
  //               .then(response => response.json())
  //               .then(tagData => {
  //                 const tagArray = tagData.tags
  //                 const newUserTag = tagArray.find(tag => tag.name === program)
  //                 const tagId = newUserTag.id
  //                 const subscribeUserUrl = `${ckBaseUrl}/tags/${tagId}/subscribe`

  //                 fetch(subscribeUserUrl, {
  //                   method: 'POST',
  //                   headers: {
  //                     'Content-Type': 'application/json'
  //                   },
  //                   body: ckReqBody
  //                 })
  //                   .then(response => response.json())
  //                   .then(() => {
  //                     res.status(200).json({
  //                       message: `success`
  //                     })
  //                   })
  //                   .catch(() => {
  //                     res.status(500).json({
  //                       message:
  //                         'There seems to be a network issue. Please contact us if you see this error message with the email you used to sign up. We will make sure your account is correct.'
  //                     })
  //                   })
  //               })
  //           }
  //         })
  //     } else {
  //       emergencyFirestoreSignUp().then(data => {})
  //     }
  //   })

  // Step 3: Make the update to the user account...

  // Step 4: Send back the all is good message
}
