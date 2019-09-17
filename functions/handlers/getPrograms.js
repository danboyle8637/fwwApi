const db = require('../utils/admin').db

// This endpoint will allow me to build the program cards.
// It also lets me put them in the right order

exports.getPrograms = (req, res) => {
  db.collection('programs')
    .orderBy('order', 'asc')
    .get()
    .then(docs => {
      const programArray = []

      docs.forEach(doc => {
        programArray.push(doc.data())
      })

      return res.status(200).json({
        message: 'Success',
        programs: programArray
      })
    })
    .catch(error => {
      return res.status(500).json({
        message:
          "Could't load the programs. Click refresh button to try again.",
        error: error
      })
    })
}
