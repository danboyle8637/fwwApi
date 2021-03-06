const db = require('../utils/admin').db
const admin = require('../utils/admin').admin

exports.postComplete = (req, res) => {
  const data = JSON.parse(req.body)

  const request = {
    programId: data.programId,
    workoutId: data.workoutId,
    completeId: data.completeId
  }

  const userId = req.userId
  const programId = request.programId
  const workoutId = request.workoutId
  const completeId = request.completeId
  const timestamp = new Date().toLocaleDateString()
  const increment = admin.firestore.FieldValue.increment(1)

  const programState = db
    .collection('users')
    .doc(userId)
    .collection('Programs')
    .doc(programId)

  const workoutStats = db
    .collection('users')
    .doc(userId)
    .collection('Programs')
    .doc(programId)
    .collection('Workouts')
    .doc(workoutId)

  const handleIncrementWorkoutsCompleted = () => {
    programState
      .update({
        workoutsCompleted: increment
      })
      .then(() => {})
      .catch(() => {})
  }

  workoutStats
    .get()
    .then(docSnapshot => {
      const data = docSnapshot.data()

      const completed1 = data.completed.complete1.isComplete
      const completed2 = data.completed.complete2.isComplete

      // Should be if(!completed1) {Do updates}
      if (completeId === 1) {
        workoutStats
          .update({
            'completed.complete1.isComplete': true,
            'completed.complete1.timestamp': timestamp,
            'trackingStats.first.number': '--',
            'trackingStats.first.date': '--',
            'trackingStats.first.timestamp': timestamp
          })
          .then(() => {
            handleIncrementWorkoutsCompleted()
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
        workoutStats
          .update({
            'completed.complete2.isComplete': true,
            'completed.complete2.timestamp': timestamp,
            'trackingStats.second.number': '--',
            'trackingStats.second.date': '--',
            'trackingStats.second.timestamp': timestamp
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
      } else if (completeId === 2 && !completed1) {
        return res.status(400).json({
          message: 'Complete first time first!'
        })
      }
      if (completeId === 3 && completed2) {
        workoutStats
          .update({
            'completed.complete3.isComplete': true,
            'completed.complete3.timestamp': timestamp,
            'trackingStats.second.number': '--',
            'trackingStats.second.date': '--',
            'trackingStats.second.timestamp': timestamp
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
      } else if (completeId === 3 && !completed2) {
        return res.status(400).json({
          message: 'Complete second time first!'
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
