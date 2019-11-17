const db = require('../utils/admin').db

exports.getPercentComplete = (req, res) => {
  const data = JSON.parse(req.body)

  const request = {
    programs: data.programs
  }

  const userId = req.userId
  const programs = request.programs

  const percentCompletePromises = programs.map(program => {
    // TODO use the return statement below. This todo refers to the signup endpoint
    // ... where the programs are setup for the user.
    return db
      .collection('users')
      .doc(userId)
      .collection('Programs')
      .doc(program)
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
        const percentData = {
          programId: programId,
          totalWorkouts: totalWorkouts,
          workoutsCompleted: workoutsCompleted,
          percentage: percent
        }

        percentCompleteArray.push(percentData)
      })

      return res.status(200).json({
        message: 'Success getting percent completed for all programs.',
        percentComplete: percentCompleteArray
      })
    })
    .catch(error => {
      return res.status(400).json({
        message:
          '😢 Must be a network issue. We could not get your program stats. Try logging out and resigning in. If it keeps happening, contact us.',
        error: error
      })
    })
}
