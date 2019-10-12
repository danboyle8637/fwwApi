const functions = require('firebase-functions')
const db = require('../utils/admin').db

exports.functions.firestore
  .document('/users/{username}/{programId}/{workoutId}')
  .onUpdate((change, context) => {
    const newDocValue = change.after.data()
    //const prevDocValue = change.before.data()

    const isCompleteFirstTime = newDocValue.completed.complete1.isComplete

    const username = context.username
    const programId = context.programId

    const increment = firebase.firestore.FieldValue.increment(1)

    if (isCompleteFirstTime === true) {
      db.collection('/users')
        .doc(username)
        .collection(programId)
        .doc('PercentComplete')
        .update({
          workoutsCompleted: increment
        })
    }
  })
