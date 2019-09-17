const db = require('../utils/admin').db

exports.toggleIsFavorite = (req, res) => {
  const request = {
    programId: req.body.programId,
    workoutId: req.body.workoutId,
    username: req.body.username
  }

  const programId = request.programId
  const workoutId = request.workoutId
  const username = request.username

  const workout = db
    .collection('users')
    .doc(username)
    .collection(programId)
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
              message: 'This workout has been marked as a favorite of yours.'
            })
          })
          .catch(error => {
            return res.status(400).json({
              message:
                'Could not save this workout as a favorite. Try again below...',
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
              message: `What!?!?! You don't like this workout anymore? Okay... it's not longer a favorite.`
            })
          })
          .catch(error => {
            return res.status(400).json({
              message: `Could not reverse your favorite. Sheesh... but try again below.`,
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
