const db = require('../utils/admin').db

exports.getPercentComplete = (req, res) => {
  // The program is going to be an array
  // You need to get the progress for each program in the array
  // Even if it's only one program in the array

  // const data = JSON.parse(req.body)

  const request = {
    username: req.body.username,
    programs: req.body.programs
  }

  const username = request.username
  const programs = request.programs

  const percentCompletePromises = programs.map(program => {
    return db
      .collection('users')
      .doc(username)
      .collection(program)
      .doc('PercentComplete')
      .get()
  })

  Promise.all(percentCompletePromises)
    .then(docSnapshotArray => {
      const percentCompleteArray = []

      docSnapshotArray.forEach(docSnapshot => {
        const docData = docSnapshot.data()
        const totalWorkouts = docData.totalWorkouts
        const workoutsCompleted = docData.workoutsCompleted
        const programId = docData.programId
        const percent = Math.round((workoutsCompleted / totalWorkouts) * 100)
        const percentData = { programId: programId, percentage: percent }

        percentCompleteArray.push(percentData)
      })

      return res.status(200).json({
        message: 'Success getting percent completed for all programs.',
        percentComplete: percentCompleteArray
      })
    })
    .catch(error => {
      return res.status(400).json({
        message: 'Could not get the percent completed for each workout',
        error: error
      })
    })
}
