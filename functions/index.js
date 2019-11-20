const functions = require('firebase-functions')
const express = require('express')
const cors = require('cors')

const fwwContactPage = require('./sendgrid/fww-contact-page')
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
const { addProgram } = require('./handlers/addProgram')
const { updateEmail } = require('./handlers/updateEmail')
const { updatePassword } = require('./handlers/updatePassword')
const { deleteAccount } = require('./handlers/deleteAccount')
const { uploadProfileImage } = require('./handlers/uploadProfileImage')
const { getUserPhotoUrl } = require('./handlers/getUserPhotoUrl')
const handleImageUpload = require('./functions/handleImageUpload')

const app = express()

app.use(cors({ origin: true }))
app.get('/get-user', Authorize, getUser)
app.post('/get-user-photo-url', Authorize, uploadProfileImage, getUserPhotoUrl)

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
app.delete('/delete-account', Authorize, deleteAccount)

exports.api = functions.https.onRequest(app)

exports.fwwContactPage = functions.https.onRequest(fwwContactPage)
exports.imageUploadAndResize = functions.https.onRequest(handleImageUpload)

// exports.updatePercentComplete = functions.firestore
//   .document('/users/{username}/{programId}/{workoutId}')
//   .onUpdate((change, context) => {
//     console.log(context)
//     const newDocValue = change.after.data()
//     //const prevDocValue = change.before.data()

//     const isCompleteFirstTime = newDocValue.completed.complete1.isComplete

//     const username = context.username
//     const programId = context.programId

//     const increment = firebase.firestore.FieldValue.increment(1)

//     if (isCompleteFirstTime === true) {
//       db.collection('/users')
//         .doc(username)
//         .collection(programId)
//         .doc('PercentComplete')
//         .update({
//           workoutsCompleted: increment
//         })
//     }
//   })
