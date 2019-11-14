const db = require('../utils/admin').db

exports.getWorkouts = (req, res) => {
  const data = JSON.parse(req.body)

  const request = {
    programId: data.programId
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
        const workoutData = workoutDoc.data()
        workoutsArray.push(workoutData)
      })

      res.status(200).json({
        message: 'Workouts retrieved.',
        workouts: workoutsArray
      })
    })
    .catch(error => {
      res.status(500).json({
        message:
          '😢 Seems like the network was down or there was a server error. Reload the page and try again. If it keeps happening, contact us to let us know.',
        error: error
      })
    })
}
