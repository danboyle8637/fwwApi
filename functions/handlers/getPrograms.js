const db = require('../utils/admin').db

// This endpoint will allow me to build the program cards.
// It also lets me put them in the right order

exports.getPrograms = (req, res) => {
  const data = JSON.parse(req.body)

  const request = {
    programIdArray: data.programIdArray
  }

  const activeProgramArray = request.programIdArray

  db.collection('programs')
    .get()
    .then(docsArray => {
      let programArray = []

      docsArray.forEach(doc => {
        const data = doc.data()
        programArray.push(data)
      })

      const sortedPrograms = activeProgramArray.reduce(
        (accumulator, currentValue) => {
          programArray.forEach(program => {
            if (program.programId === currentValue) {
              accumulator.push(program)
            }
          })

          programArray = programArray.filter(
            program => program.programId !== currentValue
          )

          return accumulator
        },
        []
      )

      const sortedProgramsArray = [...sortedPrograms, ...programArray]

      return res.status(200).json({
        message: 'Here are your programs',
        programs: sortedProgramsArray
      })
    })
    .catch(error => {
      return res.status(500).json({
        message: 'Couldnt get programs. Try again.',
        error
      })
    })
}
