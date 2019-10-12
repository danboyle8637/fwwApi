const db = require('../utils/admin').db

exports.postComplete = (req, res) => {
  const data = JSON.parse(req.body)

  const request = {
    username: data.username,
    programId: data.programId,
    workoutId: data.workoutId,
    completeId: data.completeId
  }

  const username = request.username
  const programId = request.programId
  const workoutId = request.workoutId
  const completeId = request.completeId

  const workoutStats = db
    .collection('users')
    .doc(username)
    .collection(programId)
    .doc(workoutId)

  workoutStats
    .get()
    .then(docSnapshot => {
      const data = docSnapshot.data()

      const completed1 = data.completed.complete1.isComplete
      const completed2 = data.completed.complete2.isComplete

      // Should be if(!completed1) {Do updates}
      if (completeId === 1) {
        console.log('Should be updating only Complete1')
        workoutStats
          .update({
            'completed.complete1.isComplete': true,
            'completed.complete1.timestamp': new Date().toISOString()
          })
          .then(() => {
            res.status(200).json({
              message: `Success 💪`
            })
          })
          .catch(error => {
            res.status(400).json({
              message: 'Error 😭',
              error: error
            })
          })
      }
      if (completeId === 2 && completed1) {
        console.log('Should be updating only Complete2')
        workoutStats
          .update({
            'completed.complete2.isComplete': true,
            'completed.complete2.timestamp': new Date().toISOString()
          })
          .then(() => {
            res.status(200).json({
              message: `Success 💪`
            })
          })
          .catch(error => {
            res.status(400).json({
              message: 'Error 😭',
              error: error
            })
          })
      }
      if (completeId === 3 && completed2) {
        console.log('Should be updating only Complete3')
        workoutStats
          .update({
            'completed.complete3.isComplete': true,
            'completed.complete3.timestamp': new Date().toISOString()
          })
          .then(() => {
            res.status(200).json({
              message: `Success 💪`
            })
          })
          .catch(error => {
            res.status(400).json({
              message: 'Error 😭',
              error: error
            })
          })
      }
    })
    .catch(error => {
      res.status(400).json({
        message: `Something has gone terrible wrong. Dan your programmer is an idiot!`,
        error: error
      })
    })
}
