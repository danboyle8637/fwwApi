const db = require('../utils/admin').db
const admin = require('../utils/admin').admin

exports.postWorkoutNumbers = (req, res) => {
  const data = JSON.parse(req.body)

  const request = {
    programId: data.programId,
    workoutId: data.workoutId,
    number: data.number,
    date: data.date
  }

  const userId = req.userId
  const programId = request.programId
  const workoutId = request.workoutId
  const number = Number(request.number)
  const date = request.date
  const timestamp = new Date()
  const increment = admin.firestore.FieldValue.increment(1)

  const programState = db
    .collection('users')
    .doc(userId)
    .collection('Programs')
    .doc(programId)

  const stats = db
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
      .then(() => {
        console.log('Increment successful!')
      })
      .catch(error => {
        console.log(error)
      })
  }

  stats
    .get()
    .then(docSnapshot => {
      const data = docSnapshot.data()
      if (!Object.keys(data.trackingStats).includes('first')) {
        saveFirstNumber()
      } else if (!Object.keys(data.trackingStats).includes('second')) {
        saveSecondNumber()
      } else if (!Object.keys(data.trackingStats).includes('third')) {
        saveThirdNumber()
      } else {
        res.status(200).json({
          message: `Sorry we currently don't support more than three data points. Would you want more?`
        })
      }
    })
    .catch(error => {
      return res.status(400).json({
        message: 'Could not retrieve workout stats.',
        error: error
      })
    })

  const saveFirstNumber = () => {
    stats
      .update({
        'trackingStats.first.number': number,
        'trackingStats.first.date': date,
        'trackingStats.first.timestamp': timestamp,
        'completed.complete1.isComplete': true,
        'completed.complete1.timestamp': timestamp
      })
      .then(() => {
        handleIncrementWorkoutsCompleted()
        res.status(200).json({
          message: `Success 💪`
        })
      })
      .catch(error => {
        res.status(400).json({
          message: 'Error try again 😭',
          error: error
        })
      })
  }
  const saveSecondNumber = () => {
    stats
      .update({
        'trackingStats.second.number': number,
        'trackingStats.second.date': date,
        'trackingStats.second.timestamp': timestamp,
        'completed.complete2.isComplete': true,
        'completed.complete2.timestamp': timestamp
      })
      .then(() => {
        res.status(200).json({
          message: `Success 💪`
        })
      })
      .catch(error => {
        res.status(400).json({
          message: 'Error try again 😭',
          error: error
        })
      })
  }
  const saveThirdNumber = () => {
    stats
      .update({
        'trackingStats.third.number': number,
        'trackingStats.third.date': date,
        'trackingStats.third.timestamp': timestamp,
        'completed.complete3.isComplete': true,
        'completed.complete3.timestamp': timestamp
      })
      .then(() => {
        res.status(200).json({
          message: `Success 💪`
        })
      })
      .catch(error => {
        res.status(400).json({
          message: 'Error try again 😭',
          error: error
        })
      })
  }
}
