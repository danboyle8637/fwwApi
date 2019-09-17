const db = require('../utils/admin').db

exports.getWorkout = (req, res) => {
  const request = {
    program: req.body.program,
    workout: req.body.workout
  }

  const program = request.program
  const workout = request.workout

  db.collection('programs')
    .doc(program)
    .collection('workouts')
    .doc(workout)
    .get()
    .then(workoutDoc => {
      res.status(200).send(workoutDoc.data())
    })
    .catch(error => {
      res.status(500).json({
        message: 'Could not get the workout. Click refresh and try again.',
        error: error
      })
    })
}
