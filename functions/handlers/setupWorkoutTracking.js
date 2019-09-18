// When the user hits the Program Dashbaoard... launch this function.
// It will setup Workout Tracking in the database for all of the workouts.
// But it will do this async... no update to state or anything.

const db = require('../utils/admin').db

exports.setupWorkoutTracking = (req, res) => {
  const data = JSON.parse(req.body)

  const request = {
    programId: data.programId,
    username: data.username,
    workoutsArray: data.workoutsArray
  }

  const programId = request.programId
  const username = request.username
  const workoutsArray = request.workoutsArray

  // Check, does workout tracking already exist?
  db.collection('users')
    .doc(username)
    .collection(programId)
    .get()
    .then(docsSnapshot => {
      let docsArray = []
      docsSnapshot.forEach(doc => {
        docsArray.push(doc)
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

      // const workoutDocData = {
      //   programId: programId,
      //   workoutId: workoutId,
      //   name: workoutName,
      //   completed: {
      //     complete1: {
      //       id: 1,
      //       value: 'complete1',
      //       isComplete: false
      //     },
      //     complete2: {
      //       id: 2,
      //       value: 'complete2',
      //       isComplete: false
      //     },
      //     complete3: {
      //       id: 3,
      //       value: 'complete3',
      //       isComplete: false
      //     }
      //   },
      //   trackingStats: {
      //     first: {},
      //     second: {},
      //     third: {}
      //   },
      //   isFavorite: false
      // }

      const workoutDocData = {
        workoutId: {
          programId: programId,
          workoutId: workoutId,
          name: workoutName,
          complete1: {
            isComplete: false
          },
          complete2: {
            isComplete: false
          },
          complete3: {
            isComplete: false
          },
          trackingStats1: {},
          trackingStats2: {},
          trackingStats3: {},
          isFavorite: false
        }
      }

      return db
        .collection('users')
        .doc(username)
        .collection(programId)
        .doc(workoutId)
        .set(workoutDocData)
    })

    Promise.all(workoutDocPromises)
      .then(() => {
        return res.status(200).json({
          message: 'Successfully created workout documents'
        })
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
      .collection(programId)
      .get()
      .then(docsSnapshot => {
        let docsArray = []
        docsSnapshot.forEach(doc => {
          docsArray.push(doc.data())
        })

        // How we get rid of the percentComplete document
        const statsWorkoutArray = docsArray.filter(element => {
          return element.totalWorkouts !== 5
        })

        res.status(200).json({
          message: 'Stats successfully retrieved',
          stats: statsWorkoutArray
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
