const auth = require('../utils/admin').auth
const admin = require('../utils/admin').admin
const db = require('../utils/admin').db

exports.addProgram = (req, res) => {
  const data = JSON.parse(req.body)

  const request = {
    programId: data.programId
  }

  const userId = req.userId
  const programId = request.programId
  const updatedProgramArray = []

  const user = db.collection('users').doc(userId)
  const program = db.collection('programs').doc(programId)

  program
    .get()
    .then(programDocSnapshot => {
      const data = programDocSnapshot.data()
      return data.totalWorkouts
    })
    .then(totalWorkouts => {
      const percentComplete = {
        workoutsCompleted: 0,
        totalWorkouts: totalWorkouts,
        programId: programId
      }

      return db
        .collection('users')
        .doc(userId)
        .collection('Programs')
        .doc(programId)
        .set(percentComplete)
    })
    .then(() => {
      user
        .get()
        .then(userSnapshot => {
          const programsArray = userSnapshot.data().programs
          updatedProgramArray.push(...programsArray)
          setNewProgram()
        })
        .catch(() => {
          res.status(500).json({
            message: 'Could not get user doc'
          })
        })
    })
    .catch(() => {
      res.status(500).json({
        message: 'Could add program to account.'
      })
    })

  const setNewProgram = () => {
    user
      .update({
        programs: admin.firestore.FieldValue.arrayUnion(programId)
      })
      .then(() => {
        updatedProgramArray.push(programId)

        let isFree

        if (
          programId === '7DayIgniteReset' ||
          programId === '7DayBodyBurnReset' ||
          programId === '7DayStrongReset'
        ) {
          isFree = true
        } else {
          isFree = false
        }

        auth
          .setCustomUserClaims(userId, {
            programId: updatedProgramArray,
            free: isFree
          })
          .then(() => {
            res.status(201).json({
              message: 'User and program updated',
              programArray: updatedProgramArray
            })
          })
      })
      .catch(() => {
        res.status(500).json({
          message: 'Could not update user doc'
        })
      })
  }
}
