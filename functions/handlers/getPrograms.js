const db = require('../utils/admin').db

// This endpoint will allow me to build the program cards.
// It also lets me put them in the right order

exports.getPrograms = (req, res) => {
  const data = JSON.parse(req.body)

  const request = {
    programIdArray: data.programIdArray
  }

  const usersPrograms = request.programIdArray

  db.collection('programs')
    .get()
    .then(docsArray => {
      let programsArray = []

      docsArray.forEach(doc => {
        const data = doc.data()
        programsArray.push(data)
      })

      // The whole purpose of this is to reorder the programs
      // This puts the active programs first
      // * accumulator is active user programs
      const activePrograms = usersPrograms.reduce(
        (accumulator, currentValue) => {
          programsArray.forEach(program => {
            if (program.programId === currentValue) {
              accumulator.push(program)
            }
          })

          programsArray = programsArray.filter(
            program => program.programId !== currentValue
          )

          return accumulator
        },
        []
      )

      // This ensures the Fierce programs are listed first
      programsArray.sort((a, b) => {
        if (a.price > b.price) {
          return -1
        } else {
          return 1
        }
      })

      const purchasedPrograms = [...activePrograms]

      const notPurchasedPrograms = [...programsArray]

      return res.status(200).json({
        message: 'Here are your programs',
        purchasedPrograms: purchasedPrograms,
        notPurchasedPrograms: notPurchasedPrograms
      })
    })
    .catch(error => {
      return res.status(500).json({
        message:
          '😢 Must be a network issue. We could not get your programs. Try logging out and resigning in. If it keeps happening, contact us.',
        error
      })
    })
}
