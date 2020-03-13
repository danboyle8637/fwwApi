const db = require('../utils/admin').db
const admin = require('../utils/admin').admin

exports.caseDownloadTrackingSheetVote = (req, res) => {
  const data = JSON.parse(req.body)

  const userVote = data.userVote

  const incrementYes = admin.firestore.FieldValue.increment(1)
  const incrementNo = admin.firestore.FieldValue.increment(-1)

  const counterDoc = db.collection('appData').doc('fwwReset')

  if (userVote === 'yes') {
    counterDoc
      .update({ shouldDownloadTrackingSheets: incrementYes })
      .then(() => {
        res.status(201).json({
          message: `Thanks 💕`
        })
      })
      .catch(() => {
        res.status(500).json({
          message: 'Server error. Try again!'
        })
      })
  } else if (userVote === 'no') {
    counterDoc
      .update({ shouldDownloadTrackingSheets: incrementNo })
      .then(() => {
        res.status(201).json({
          message: `Thanks 💕`
        })
      })
      .catch(() => {
        res.status(500).json({
          message: 'Server error. Try again!'
        })
      })
  } else {
    res.status(500).json({
      message: 'Server error. Try again!'
    })
  }
}
