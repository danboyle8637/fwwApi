const admin = require('../../utils/admin').admin
const db = require('../../utils/admin').db

const { getUpdatedProgramsHelper } = require('./getUpdatedProgramsHelper')
const { setConvertKitProgramTag } = require('./setConvertKitProgramTag')

exports.addProgram = (req, res) => {
  const data = JSON.parse(req.body)

  const request = {
    programId: data.programId
  }

  const userId = req.userId
  const programId = request.programId
  let addToPercentComplete = {}

  const user = db.collection('users').doc(userId)

  const program = db.collection('programs').doc(programId)

  const setUserProgramDoc = () => {
    return new Promise((resolve, reject) => {
      program
        .get()
        .then(programSnapshot => {
          const totalWorkouts = programSnapshot.data().totalWorkouts

          const percentComplete = {
            workoutsCompleted: 0,
            totalWorkouts: totalWorkouts,
            programId: programId
          }

          addToPercentComplete = { ...percentComplete }

          db.collection('users')
            .doc(userId)
            .collection('Programs')
            .doc(programId)
            .set(percentComplete)
            .then(() => {
              resolve(`User's new program doc set up!`)
            })
            .catch(error => {
              reject(error)
            })
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  const addProgramToUser = () => {
    return new Promise((resolve, reject) => {
      user
        .update({
          programs: admin.firestore.FieldValue.arrayUnion(programId)
        })
        .then(() => {
          resolve(`Program added to user's owned programs`)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  const getUsersProgramArray = () => {
    return new Promise((resolve, reject) => {
      user
        .get()
        .then(userSnapshot => {
          const programArray = userSnapshot.data().programs
          resolve(programArray)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  addProgramToUser()
    .then(() => {
      return setUserProgramDoc()
    })
    .then(() => {
      return setConvertKitProgramTag(userId, programId)
    })
    .then(() => {
      return getUsersProgramArray()
    })
    .then(programArray => {
      return getUpdatedProgramsHelper(programArray)
    })
    .then(programData => {
      const purchasedPrograms = programData.purchasedPrograms
      const notPurchasedPrograms = programData.notPurchasedPrograms
      res.status(200).json({
        purchasedPrograms,
        notPurchasedPrograms,
        addToPercentComplete
      })
    })
    .catch(error => {
      res.status(500).json({
        error
      })
    })
}
