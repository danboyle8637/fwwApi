// When the user hits the Program Dashbaoard... launch this function.
// It will setup Workout Tracking in the database for all of the workouts.
// But it will do this async... no update to state or anything.
// This can be a background function

const db = require('../utils/admin').db

exports.setupWorkoutTracking = (req, res) => {
  const data = JSON.parse(req.body)

  const request = {
    programId: data.programId,
    workoutsArray: data.workoutsArray
  }

  const programId = request.programId
  const userId = req.userId
  const workoutsArray = request.workoutsArray

  // Check, does workout tracking already exist?
  db.collection('users')
    .doc(userId)
    .collection('Programs')
    .doc(programId)
    .listCollections()
    .then(collections => {
      if (collections.length > 0) {
        // Workouts collection exists
        sendBackWorkoutTracking()
      } else {
        // Workouts collection does not exist
        createWorkoutTracking()
      }
    })

  const createWorkoutTracking = () => {
    const workoutDocPromises = workoutsArray.map(workout => {
      const workoutId = workout.workoutId
      const workoutTitle = workout.title

      const workoutDocData = {
        programId: programId,
        workoutId: workoutId,
        title: workoutTitle,
        completed: {
          complete1: {
            id: 1,
            value: 'complete1',
            isComplete: false
          },
          complete2: {
            id: 2,
            value: 'complete2',
            isComplete: false
          },
          complete3: {
            id: 3,
            value: 'complete3',
            isComplete: false
          }
        },
        trackingStats: {},
        isFavorite: false
      }

      return db
        .collection('users')
        .doc(userId)
        .collection('Programs')
        .doc(programId)
        .collection('Workouts')
        .doc(workoutId)
        .set(workoutDocData)
    })

    Promise.all(workoutDocPromises)
      .then(() => {
        sendBackWorkoutTracking()
      })
      .catch(error => {
        return res.status(404).json({
          message:
            '😬 Either a network or server error has stopped us from setting up your workout stats. Refresh to try again or contact us if this keeps happening.',
          error: error
        })
      })
  }

  const sendBackWorkoutTracking = () => {
    db.collection('users')
      .doc(userId)
      .collection('Programs')
      .doc(programId)
      .collection('Workouts')
      .get()
      .then(collectionSnapshot => {
        let docsArray = []
        collectionSnapshot.forEach(doc => {
          docsArray.push(doc.data())
        })

        const stats = docsArray.reduce((accumulator, currentValue) => {
          const complete1 = currentValue.completed.complete1
          const complete2 = currentValue.completed.complete2
          const complete3 = currentValue.completed.complete3
          const trackingStats = currentValue.trackingStats
          const workoutId = currentValue.workoutId
          accumulator[workoutId] = {
            completed: {
              complete1,
              complete2,
              complete3
            },
            trackingStats: trackingStats,
            isFavorite: currentValue.isFavorite,
            title: currentValue.title,
            programId: currentValue.programId,
            workoutId: currentValue.workoutId
          }
          return accumulator
        }, {})

        return res.status(200).json({
          message: 'Stats retrieved',
          stats: stats
        })
      })
      .catch(error => {
        return res.status(404).json({
          message:
            '😢 Either a server or network error has stopped us from getting your workout stats. Refresh to try again or let us know if this keeps happening.',
          error: error
        })
      })
  }
}
