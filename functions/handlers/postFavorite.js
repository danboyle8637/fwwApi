const db = require('../utils/admin').db

exports.postFavorite = (req, res) => {
  const data = JSON.parse(req.body)

  const request = {
    programId: data.programId,
    workoutId: data.workoutId
  }

  const programId = request.programId
  const workoutId = request.workoutId
  const userId = req.userId

  const workout = db
    .collection('users')
    .doc(userId)
    .collection('Programs')
    .doc(programId)
    .collection('Workouts')
    .doc(workoutId)

  workout
    .get()
    .then(docSnapshot => {
      const data = docSnapshot.data()
      const isFavorite = data.isFavorite

      if (!isFavorite) {
        workout
          .set(
            {
              isFavorite: true
            },
            { merge: true }
          )
          .then(() => {
            return res.status(200).json({
              message: 'Awesome! 💕'
            })
          })
          .catch(error => {
            return res.status(400).json({
              message: 'Error 😭',
              error: error
            })
          })
      }
      if (isFavorite) {
        workout
          .set(
            {
              isFavorite: false
            },
            { merge: true }
          )
          .then(() => {
            return res.status(200).json({
              message: `Sad but done. 😢`
            })
          })
          .catch(error => {
            return res.status(400).json({
              message: 'Error 😭',
              error: error
            })
          })
      }
    })
    .catch(error => {
      return res.status(400).json({
        message: 'Could not get your workout data. Try again below...',
        error: error
      })
    })
}
