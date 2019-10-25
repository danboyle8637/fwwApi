const functions = require('firebase-functions')
const express = require('express')
const cors = require('cors')

const fwwContactPage = require('./sendgrid/fww-contact-page')
const { Authorize } = require('./middleware/Authorize')
const { signUp } = require('./handlers/signUp')
const { getUser } = require('./handlers/getUser')
const { getPrograms } = require('./handlers/getPrograms')
const { getWorkouts } = require('./handlers/getWorkouts')
const { getPercentComplete } = require('./handlers/getPercentComplete')
const { setupWorkoutTracking } = require('./handlers/setupWorkoutTracking')
const { postComplete } = require('./handlers/postComplete')
const { postWorkoutNumbers } = require('./handlers/postWorkoutNumbers')
const { postFavorite } = require('./handlers/postFavorite')
const { updateEmail } = require('./handlers/updateEmail')
const { updatePassword } = require('./handlers/updatePassword')
const { uploadProfileImage } = require('./handlers/uploadProfileImage')

const app = express()

app.use(cors({ origin: true }))

app.get('/get-programs', getPrograms)
app.post('/sign-up', signUp)
app.post('/get-user', getUser)
app.post('/get-percent-complete', getPercentComplete)
app.post('/get-workouts', getWorkouts)
app.post('/setup-workout-tracking', setupWorkoutTracking)
app.post('/set-complete', postComplete)
app.post('/post-workout-numbers', postWorkoutNumbers)
app.post('/toggle-favorite', postFavorite)
app.post('/update-email', updateEmail)
app.post('/update-password', updatePassword)
app.post('/uploadProfileImage', Authorize, uploadProfileImage)

exports.api = functions.https.onRequest(app)

exports.fwwContactPage = functions.https.onRequest(fwwContactPage)

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
