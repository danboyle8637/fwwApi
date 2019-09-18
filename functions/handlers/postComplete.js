const db = require('../utils/admin').db

exports.postComplete = (req, res) => {
  const request = {
    username: req.body.username,
    programId: req.body.programId,
    workoutId: req.body.workoutId,
    completeId: req.body.completeId
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

      const name = data.name
      const completed1 = data.completed.complete1.isComplete
      const completed2 = data.completed.complete2.isComplete

      if (completeId === 'complete1') {
        console.log('Should be updating only Complete1')
        workoutStats
          .update({
            'completed.complete1.isComplete': true,
            'completed.complete1.timestamp': new Date().toISOString()
          })
          .then(() => {
            res.status(200).json({
              message: `Congrats on completing ${name} for the first time!`
            })
          })
          .catch(error => {
            res.status(400).json({
              message: `Could not mark as complete. Close window and try again.`,
              error: error
            })
          })
      }

      if (completeId === 'complete2' && completed1) {
        console.log('Should be updating only Complete2')
        workoutStats
          .update({
            'completed.complete2.isComplete': true,
            'completed.complete2.timestamp': new Date().toISOString()
          })
          .then(() => {
            res.status(200).json({
              message: `Congrats on completing ${name} for the second time!`
            })
          })
          .catch(error => {
            res.status(400).json({
              message: `You need to complete the workout before you can complete it again.`,
              error: error
            })
          })
      }

      if (completeId === 'complete3' && completed2) {
        console.log('Should be updating only Complete3')
        workoutStats
          .update({
            'completed.complete3.isComplete': true,
            'completed.complete3.timestamp': new Date().toISOString()
          })
          .then(() => {
            res.status(200).json({
              message: `Congrats on completing ${name} for the final time!`
            })
          })
          .catch(error => {
            res.status(400).json({
              message: `You need to complete the workout before you can complete it a second time.`,
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
