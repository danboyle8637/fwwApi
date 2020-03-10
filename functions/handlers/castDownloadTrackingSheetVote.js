const db = require('../utils/admin').db
const admin = require('../utils/admin').admin

exports.caseDownloadTrackingSheetVote = (req, res) => {
  const data = JSON.parse(req.body)

  const userVote = data.userVote

  const incrementYes = admin.firestore.FieldValue.increment(1)
  const incrementNo = admin.firestore.FieldValue.increment(-1)

  if (userVote === 'yes') {
    db.collection('appData')
      .doc('fwwReset')
      .update({
        shouldDownloadTrackingSheets: incrementYes
      })
      .then(() => {
        return res.status(201).json({
          message: `Thanks 💕`
        })
      })
  } else if (userVote === 'no') {
    db.collection('appData')
      .doc('fwwReset')
      .update({
        shouldDownloadTrackingSheets: incrementNo
      })
      .then(() => {
        return res.status(201).json({
          message: `Thanks 💕`
        })
      })
  } else {
    return res.status(400).json({
      message: 'Invalid vote 🤔'
    })
  }
}
