const db = require('../../utils/admin').db

exports.getUpdatedProgramsHelper = programIdArray => {
  return new Promise((resolve, reject) => {
    db.collection('programs')
      .get()
      .then(programDocsArray => {
        let programsArray = []

        // Making a copy of all programs in app
        programDocsArray.forEach(programDoc => {
          programsArray.push(programDoc.data())
        })

        // Creating the purchased and unpurchased program arrays
        const usersPrograms = programIdArray.reduce(
          (accumulator, currentValue) => {
            programsArray.forEach(program => {
              if (program.programId === currentValue) {
                accumulator.push(program)
              }
            })

            programsArray = programsArray.filter(program => {
              return program.programId !== currentValue
            })

            return accumulator
          },
          []
        )

        const purchasedPrograms = [...usersPrograms]

        const notPurchasedPrograms = [...programsArray]

        purchasedPrograms.sort((a, b) => {
          if (a.price > b.price) {
            return -1
          } else {
            return 1
          }
        })

        notPurchasedPrograms.sort((a, b) => {
          if (a.price > b.price) {
            return -1
          } else {
            return 1
          }
        })

        resolve({
          purchasedPrograms: purchasedPrograms,
          notPurchasedPrograms: notPurchasedPrograms
        })
      })
      .catch(error => {
        reject({
          message: 'Could not get programs for Firestore',
          error: error
        })
      })
  })
}
