const db = require('../utils/admin').db

exports.getWorkouts = (req, res) => {
  //const data = JSON.parse(req.body)

  const request = {
    programId: req.body.programId
  }

  const programId = request.programId

  db.collection('programs')
    .doc(programId)
    .collection('workouts')
    .orderBy('order', 'asc')
    .get()
    .then(workoutDocs => {
      let workoutsArray = []

      workoutDocs.forEach(workoutDoc => {
        workoutsArray.push(workoutDoc.data())
      })

      res.status(200).json({
        message: 'Workout successfully retrieved.',
        workouts: workoutsArray
      })
    })
    .catch(error => {
      res.status(500).json({
        message: "Could't load workouts. Click refresh button to try again.",
        error: error
      })
    })
}
