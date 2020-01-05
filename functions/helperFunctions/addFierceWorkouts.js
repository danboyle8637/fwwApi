const db = require('../utils/admin').db

exports.addFierceWorkouts = (req, res) => {
  const data = req.body

  const request = {
    coachingBackground: data.coachingBackground,
    coachingTinyBackground: data.coachingTinyBackground,
    coachingVideo: data.coachingVideo,
    description: data.description,
    order: data.order,
    title: data.title,
    trackingGoal: data.trackingGoal,
    trackingSheetUrl: data.trackingSheetUrl,
    workout: data.workout,
    workoutBackgrounds: data.workoutBackgrounds,
    workoutFocus: data.workoutFocus,
    workoutId: data.workoutId,
    workoutTinyBackground: data.workoutTinyBackground,
    workoutVideos: data.workoutVideos
  }

  db.collection('programs')
    .doc('FierceStrong')
    .collection('workouts')
    .doc('TwoSided')
    .set(request)
    .then(() => {
      res.status(200).json({
        message: 'Workout should be set.'
      })
    })
    .catch(() => {
      res.status(500).json({
        message: 'Workout was not uploaded correctly.'
      })
    })
}
