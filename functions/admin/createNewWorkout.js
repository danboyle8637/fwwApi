const db = require('../utils/admin').db

exports.createNewWorkout = (req, res) => {
  const data = req.body

  const programId = data.programId
  const coachingBackground = data.coachingBackground
  const coachingTinyBackground = data.coachingTinyBackground
  const coachingVideo = data.coachingVideo
  const description = data.description
  const order = data.order
  const title = data.title
  const trackingGoal = data.trackingGoal
  const trackingSheetUrl = data.trackingSheetUrl
  const workout = data.workout
  const workoutBackgrounds = data.workoutBackgrounds
  const workoutFocus = data.workoutFocus
  const workoutId = data.workoutId
  const workoutTinyBackground = data.workoutTinyBackground
  const workoutVideos = data.workoutVideos

  const workoutDoc = {
    coachingBackground,
    coachingTinyBackground,
    coachingVideo,
    description,
    order,
    title,
    trackingGoal,
    trackingSheetUrl,
    workout,
    workoutBackgrounds,
    workoutFocus,
    workoutId,
    workoutTinyBackground,
    workoutVideos
  }

  db.collection('programs')
    .doc(programId)
    .collection('workouts')
    .doc(workoutId)
    .set(workoutDoc)
    .then(() => {
      return res.status(200).json({
        message: `Success! Workout ${title} was successfully added.`
      })
    })
    .catch(() => {
      return res.status(500).json({
        message: `Error... workout ${title} was not added.`
      })
    })
}
