const db = require('../utils/admin').db

exports.postWorkoutNumbers = (req, res) => {
  const request = {
    username: req.body.username,
    programId: req.body.programId,
    workoutId: req.body.workoutId,
    number: req.body.number
  }

  const username = request.username
  const programId = request.programId
  const workoutId = request.workoutId
  const number = request.number
  const timestamp = new Date().toISOString()

  const stats = db
    .collection('users')
    .doc(username)
    .collection(programId)
    .doc(workoutId)

  stats
    .get()
    .then(docSnapshot => {
      const data = docSnapshot.data()
      if (Object.keys(data.trackingGoal.first).length === 0) {
        saveFirstNumber()
      } else if (Object.keys(data.trackingGoal.second).length === 0) {
        saveSecondNumber()
      } else if (Object.keys(data.trackingGoal.third).length === 0) {
        saveThirdNumber()
      } else {
        res.status(200).json({
          message: `Sorry we won't save anymore data for this workout at this time.`
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
      .set(
        {
          trackingGoal: {
            first: {
              number: number,
              timestamp: timestamp
            }
          }
        },
        { merge: true }
      )
      .then(() => {
        res.status(200).json({
          message: `Successfully saved your result... ${number}`
        })
      })
      .catch(error => {
        res.status(400).json({
          message: 'Could not save your data. Try again, click below.',
          error: error
        })
      })
  }

  const saveSecondNumber = () => {
    stats
      .set(
        {
          trackingGoal: {
            second: {
              number: number,
              timestamp: timestamp
            }
          }
        },
        { merge: true }
      )
      .then(() => {
        res.status(200).json({
          message: `Successfully saved your result... ${number}`
        })
      })
      .catch(error => {
        res.status(400).json({
          message: 'Could not save your data. Try again, click below.',
          error: error
        })
      })
  }

  const saveThirdNumber = () => {
    stats
      .set(
        {
          trackingGoal: {
            third: {
              number: number,
              timestamp: timestamp
            }
          }
        },
        { merge: true }
      )
      .then(() => {
        res.status(200).json({
          message: `Successfully saved your result... ${number}`
        })
      })
      .catch(error => {
        res.status(400).json({
          message: 'Could not save your data. Try again, click below.',
          error: error
        })
      })
  }
}
