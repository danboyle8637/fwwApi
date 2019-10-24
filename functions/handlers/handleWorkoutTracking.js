// When the user hits the Program Dashbaoard... launch this function.
// It will setup Workout Tracking in the database for all of the workouts.
// But it will do this async... no update to state or anything.

const db = require('../utils/admin').db

exports.handleWorkoutTracking = (req, res) => {
  //const data = JSON.parse(req.body)

  const request = {
    programId: req.body.programId,
    username: req.body.username,
    workoutsArray: req.body.workoutsArray
  }

  const programId = request.programId
  const username = request.username
  const workoutsArray = request.workoutsArray

  // Check, does workout tracking already exist?
  db.collection('users')
    .doc(username)
    .collection('Programs')
    .doc(programId)
    .collection('Workouts')
    .get()
    .then(docsSnapshot => {
      let docsArray = []
      docsSnapshot.forEach(doc => {
        docsArray.push(doc.data())
      })
      if (docsArray.length > 1) {
        sendBackWorkoutTracking()
      } else {
        createWorkoutTracking()
      }
    })
    .catch(error => {
      return res.status(400).json({
        message: `Error getting docs in collection ${programId}`,
        error: error
      })
    })

  const createWorkoutTracking = () => {
    const workoutDocPromises = workoutsArray.map(workout => {
      const workoutId = workout.workoutId
      const workoutName = workout.name

      const workoutDocData = {
        programId: programId,
        workoutId: workoutId,
        name: workoutName,
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
        trackingStats: {
          first: {
            number: null,
            timestamp: null
          },
          second: {
            number: null,
            timestamp: null
          },
          third: {
            number: null,
            timestamp: null
          }
        },
        isFavorite: false
      }

      return db
        .collection('users')
        .doc(username)
        .collection('Programs')
        .doc(programId)
        .collection('Workouts')
        .doc(workoutId)
        .set(workoutDocData)
    })

    Promise.all(workoutDocPromises)
      .then(() => {
        res.json({
          message: 'Workout tracking successfully setup'
        })
        //sendBackWorkoutTracking()
      })
      .catch(error => {
        return res.status(404).json({
          message: 'Workout documents not successfully created',
          error: error
        })
      })
  }

  const sendBackWorkoutTracking = () => {
    db.collection('users')
      .doc(username)
      .collection('Programs')
      .get()
      .then(docsSnapshot => {
        let docsArray = []
        docsSnapshot.forEach(doc => {
          docsArray.push(doc.data())
        })
        const percentComplete = docsArray.filter(element => {
          return element.title === 'PercentComplete'
        })
        // How we get rid of the percentComplete document
        const statsWorkoutArray = docsArray.filter(element => {
          return element.totalWorkouts !== 5
        })
        // TODO You need to decide how you want the dats in client state to be
        // That is what you will construct here and send back
        const stats = statsWorkoutArray.reduce((accumulator, currentValue) => {
          const complete1 = currentValue.completed.complete1
          const complete2 = currentValue.completed.complete2
          const complete3 = currentValue.completed.complete3
          const first = currentValue.trackingStats.first
          const second = currentValue.trackingStats.second
          const third = currentValue.trackingStats.third
          const workoutId = currentValue.workoutId
          accumulator[workoutId] = {
            completed: {
              complete1,
              complete2,
              complete3
            },
            trackingStats: {
              first,
              second,
              third
            },
            isFavorite: currentValue.isFavorite,
            name: currentValue.name,
            programId: currentValue.programId,
            workoutId: currentValue.workoutId
          }
          return accumulator
        }, {})
        res.status(200).json({
          message: 'Stats successfully retrieved',
          percentComplete: percentComplete,
          stats: stats
        })
      })
      .catch(error => {
        res.status(404).json({
          message: 'Could not get workouts stats. Please try again.',
          error: error
        })
      })
  }
}
