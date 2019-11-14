const db = require('../utils/admin').db
const auth = require('../utils/admin').auth

const {
  checkIsEmail,
  checkIsEmpty,
  cleanAndCheckUsername,
  formatNames
} = require('../utils/formatValidate')

exports.signUpSocialAccount = (req, res) => {
  const data = JSON.parse(req.body)

  const request = {
    userId: data.userId,
    programId: data.programId,
    totalWorkouts: data.totalWorkouts,
    firstName: data.firstName,
    email: data.email,
    biggestObstacle: data.biggestObstacle,
    photoUrl: data.photoUrl
  }

  let errors = {}

  const isFirstNameEmpty = checkIsEmpty(request.firstName)
  const isBiggestObstacleEmpty = checkIsEmpty(request.biggestObstacle)
  const isEmailValid = checkIsEmail(request.email)
  const formattedFirstName = formatNames(request.firstName)
  const formattedUsername = cleanAndCheckUsername(request.username)

  if (isFirstNameEmpty) {
    errors.firstName = 'Enter your first name.'
  }

  if (formattedUsername === false) {
    errors.username = 'Check your username.'
  }

  if (!isEmailValid) {
    errors.email = 'Enter valid email address.'
  }

  if (isBiggestObstacleEmpty) {
    errors.biggestObstacle = 'Select a biggest obstacle.'
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: 'Input validation errors',
      errors: errors
    })
  }

  const cleanUserInfo = {
    userId: request.userId,
    programId: request.programId,
    totalWorkouts: request.totalWorkouts,
    firstName: formattedFirstName,
    email: request.email.toLowerCase(),
    biggestObstacle: request.biggestObstacle,
    photoUrl: request.photoUrl
  }

  auth.getUser(cleanUserInfo.userId).then(userCredential => {
    const userId = userCredential.uid

    db.collection('users')
      .doc(userId)
      .get()
      .then(docSnapshot => {
        if (docSnapshot.exists) {
          return res.status(400).json({
            message: 'Account exists. Try again.'
          })
        } else {
          return auth.updateUser(userId, {
            email: cleanUserInfo.email,
            displayName: cleanUserInfo.firstName,
            photoURL: cleanUserInfo.photoUrl
          })
        }
      })
      .then(() => {
        let isFree

        if (
          cleanUserInfo.programId === '7DayIgniteReset' ||
          cleanUserInfo.programId === '7DayBodyBurnReset' ||
          cleanUserInfo.programId === '7DayStrongReset'
        ) {
          isFree = true
        } else {
          isFree = false
        }

        auth
          .setCustomUserClaims(userId, {
            programId: [cleanUserInfo.programId],
            free: isFree
          })
          .then(() => {
            return
          })

        const userDoc = {
          userId: userId,
          firstName: cleanUserInfo.firstName,
          programs: [cleanUserInfo.programId],
          biggestObstacle: cleanUserInfo.biggestObstacle,
          photoUrl: cleanUserInfo.photoUrl,
          photoUrlTiny: '',
          createdAt: new Date().toLocaleDateString()
        }

        return db
          .collection('users')
          .doc(userDoc.userId)
          .set(userDoc)
      })
      .then(() => {
        const userAccountDoc = {
          firstName: cleanUserInfo.firstName,
          userId: userId,
          email: cleanUserInfo.email
        }

        return db
          .collection('accounts')
          .doc(userId)
          .set(userAccountDoc)
      })
      .then(() => {
        const percentComplete = {
          workoutsCompleted: 0,
          totalWorkouts: cleanUserInfo.totalWorkouts,
          programId: cleanUserInfo.programId
        }

        return db
          .collection('users')
          .doc(userId)
          .collection('Programs')
          .doc(cleanUserInfo.programId)
          .set(percentComplete)
      })
      .then(() => {
        const programsArray = []
        programsArray.push(cleanUserInfo.programId)

        return res.status(201).json({
          message: '💪 Account Created. Congrats!',
          firstName: cleanUserInfo.firstName,
          photoUrl: cleanUserInfo.photoUrl,
          photoUrlTiny: '',
          programs: programsArray
        })
      })
      .catch(error => {
        return res.status(500).json({
          message: `😢 A network or server error prevented us from setting your account up. This is important. Logout of the app and log back in. If you can't see your programs... contact us immediately!`,
          error: error
        })
      })
  })
}
