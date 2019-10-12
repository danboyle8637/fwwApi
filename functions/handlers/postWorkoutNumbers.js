const db = require('../utils/admin').db

exports.postWorkoutNumbers = (req, res) => {
  const data = JSON.parse(req.body)

  const request = {
    username: data.username,
    programId: data.programId,
    workoutId: data.workoutId,
    number: data.number,
    date: data.date
  }

  const username = request.username
  const programId = request.programId
  const workoutId = request.workoutId
  const number = Number(request.number)
  const date = request.date
  const timestamp = new Date()

  /* 
    TODO - If you mark a workout complete without tracking a number.
    Then you go back and track the workout, it does not mark the 
    workout complete for the second or third time. But it should.
  */

  const stats = db
    .collection('users')
    .doc(username)
    .collection(programId)
    .doc(workoutId)

  stats
    .get()
    .then(docSnapshot => {
      const data = docSnapshot.data()
      if (
        Object.keys(data.trackingStats.first).length === 0 ||
        data.trackingStats.first.number === null
      ) {
        saveFirstNumber()
      } else if (
        Object.keys(data.trackingStats.second).length === 0 ||
        data.trackingStats.second.number === null
      ) {
        saveSecondNumber()
      } else if (
        Object.keys(data.trackingStats.third).length === 0 ||
        data.trackingStats.third.number === null
      ) {
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
        res.status(200).json({
          message: `Success 😀`
        })
      })
      .catch(error => {
        res.status(400).json({
          message: 'Error 😭',
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
          message: `Success 😀`
        })
      })
      .catch(error => {
        res.status(400).json({
          message: 'Error 😭',
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
          message: `Success 😀`
        })
      })
      .catch(error => {
        res.status(400).json({
          message: 'Error 😭',
          error: error
        })
      })
  }
}
