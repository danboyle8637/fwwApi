const {
  emergencyFirestoreSignUp
} = require('../utils/emergencyFirestoreSignUp')

exports.testEndpoint = (req, res) => {
  const request = {
    userId: req.body.userId,
    programId: req.body.programId,
    totalWorkouts: req.body.totalWorkouts,
    firstName: req.body.firstName,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    email: req.body.email,
    biggestObstacle: req.body.biggestObstacle
  }

  const firestoreResult = emergencyFirestoreSignUp(request)

  res.send(firestoreResult)
}
