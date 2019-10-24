const db = require('../utils/admin').db

// This endpoint will allow me to build the program cards.
// It also lets me put them in the right order

exports.getPrograms = (req, res) => {
  const request = {
    // It would be an array of programIds
    programs: req.body.programs
  }

  const programs = request.programs

  const programPromises = programs.map(program => {
    return db
      .collection('programs')
      .doc(program)
      .get()
  })

  Promise.all(programPromises)
    .then(docSnapshotArray => {
      let activeProgramArray = []

      docSnapshotArray.forEach(doc => {
        const data = doc.data()
        activeProgramArray.push(data)
      })

      return res.status(200).json({
        message: 'Success',
        programs: activeProgramArray
      })
    })
    .catch(error => {
      return res.status(500).json({
        message: 'Server error. Try again!',
        error: error
      })
    })
}
