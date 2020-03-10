require('dotenv').config({
  path: `.env`
})
const functions = require('firebase-functions')
const express = require('express')
const cors = require('cors')
const sgMail = require('@sendgrid/mail')

const { Authorize } = require('./middleware/Authorize')
const { signUp } = require('./handlers/signUp')
const { signUpSocialAccount } = require('./handlers/signUpSocialAccount')
const { getUser } = require('./handlers/getUser')
const { getPrograms } = require('./handlers/getPrograms')
const { getWorkouts } = require('./handlers/getWorkouts')
const { getPercentComplete } = require('./handlers/getPercentComplete')
const { setupWorkoutTracking } = require('./handlers/setupWorkoutTracking')
const { postComplete } = require('./handlers/postComplete')
const { postWorkoutNumbers } = require('./handlers/postWorkoutNumbers')
const { postFavorite } = require('./handlers/postFavorite')
const { addProgram } = require('./handlers/addProgram/addProgram')
const { updateEmail } = require('./handlers/updateEmail')
const { updatePassword } = require('./handlers/updatePassword')
const { deleteAccount } = require('./handlers/deleteAccount')
const { uploadProfileImage } = require('./handlers/uploadProfileImage')
const { getUserPhotoUrl } = require('./handlers/getUserPhotoUrl')
const { ReviewImageUpload } = require('./middleware/ReviewImageUpload')
const { saveReview } = require('./handlers/saveReview')
const { ckAddResetMember } = require('./handlers/ckAddResetMember')
const { ckNotFinishResetSignUp } = require('./handlers/ckNotFinishResetSignUp')
const { ckAddReviewer } = require('./handlers/ckAddReviewer')
const { handleResetContactForm } = require('./handlers/handleResetContactForm')
const { handleFWWContactPage } = require('./convertKit/handleFWWContactPage')
const {
  caseDownloadTrackingSheetVote
} = require('./handlers/castDownloadTrackingSheetVote')
const {
  emergencyCompleteSignUp
} = require('./handlers/emergencyCreateUserData')
const {
  emergencySocialCompleteSignUp
} = require('./handlers/emergencySocialCreateUserData')
const { chargeCard } = require('./handlers/chargeCard')

const app = express()

app.use(cors({ origin: true }))
app.get('/get-user', Authorize, getUser)
app.get('/delete-account', Authorize, deleteAccount)

app.post('/sign-up', signUp)
app.post('/sign-up-social-account', signUpSocialAccount)
app.post('/get-programs', Authorize, getPrograms)
app.post('/get-percent-complete', Authorize, getPercentComplete)
app.post('/get-workouts', Authorize, getWorkouts)
app.post('/setup-workout-tracking', Authorize, setupWorkoutTracking)
app.post('/set-complete', Authorize, postComplete)
app.post('/post-workout-numbers', Authorize, postWorkoutNumbers)
app.post('/toggle-favorite', Authorize, postFavorite)
app.post('/add-program', Authorize, addProgram)
app.post('/update-email', Authorize, updateEmail)
app.post('/update-password', Authorize, updatePassword)
app.post('/get-user-photo-url', Authorize, uploadProfileImage, getUserPhotoUrl)
app.post('/save-review', Authorize, ReviewImageUpload, saveReview)
app.post('/not-finish-reset-signup', ckNotFinishResetSignUp)
app.post('/add-member-to-convertkit', ckAddResetMember)
app.post('/add-reset-reviewer', ckAddReviewer)
app.post('/reset-contact-form', handleResetContactForm)
app.post('/cast-download-tracking-sheet-vote', caseDownloadTrackingSheetVote)
app.post('/emergency-create-user', emergencyCompleteSignUp)
app.post('/emergency-social-create-user', emergencySocialCompleteSignUp)
app.post('/charge', Authorize, chargeCard)

// This is my REST-ish app for talking to my database
exports.api = functions.https.onRequest(app)

// This is a function to handle the contact form on FWW Marketing Site
exports.fwwContactPage = functions.https.onRequest(handleFWWContactPage)

exports.emailFWWReview = functions.firestore
  .document('reviews/{userId}')
  .onCreate((snapshot, context) => {
    sgMail.setApiKey(process.env.SEND_GRID_KEY)
    const docData = snapshot.data()
    const firstName = docData.firstName
    const stars = docData.stars
    const review = docData.review

    const emailMessage = {
      to: 'kindal@fitwomensweekly.com',
      from: 'fww@fitwomensweekly.com',
      templateId: 'd-498a71e057cc4926b563e1d59b605427',
      dynamic_template_data: {
        firstName: firstName,
        stars: stars,
        review: review
      }
    }

    sgMail
      .send(emailMessage)
      .then(() => {})
      .catch(() => {})
  })
