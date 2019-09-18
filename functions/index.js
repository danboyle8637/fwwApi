const functions = require('firebase-functions')
const express = require('express')
const cors = require('cors')

const fwwContactPage = require('./sendgrid/fww-contact-page')
const { Authorize } = require('./middleware/Authorize')
const { signUp } = require('./handlers/signUp')
const { getUser } = require('./handlers/getUser')
const { getPrograms } = require('./handlers/getPrograms')
const { getWorkouts } = require('./handlers/getWorkouts')
const { getWorkout } = require('./handlers/getWorkout')
const { getPercentComplete } = require('./handlers/getPercentComplete')
const { setupWorkoutTracking } = require('./handlers/setupWorkoutTracking')
const { postComplete } = require('./handlers/postComplete')
const { postWorkoutNumbers } = require('./handlers/postWorkoutNumbers')
const { postFavorite } = require('./handlers/postFavorite')
const { uploadProfileImage } = require('./handlers/uploadProfileImage')

const app = express()

app.use(cors({ origin: true }))

// app.use((req, res) => {
//   res.header('Access-Control-Allow-Origin', '*')
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept, Authorization'
//   )

//   if (req.method === 'OPTIONS') {
//     res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
//     return res.status(200).json({})
//   }
// })

app.get('/get-programs', getPrograms)
app.get('/get-workout', getWorkout)

app.post('/sign-up', signUp)
app.post('/get-user', getUser)
app.post('/get-percent-complete', getPercentComplete)
app.post('/get-workouts', getWorkouts)
app.post('/setup-workout-tracking', setupWorkoutTracking)
app.post('/toggle-complete', postComplete)
app.post('/post-workout-numbers', postWorkoutNumbers)
app.post('/toggle-favorite', postFavorite)
app.post('/uploadProfileImage', Authorize, uploadProfileImage)

exports.api = functions.https.onRequest(app)

exports.fwwContactPage = functions.https.onRequest(fwwContactPage)
