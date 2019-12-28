const db = require('../utils/admin').db
const auth = require('../utils/admin').auth

const { prodConfig } = require('../fbconfig')
const {
  checkIsEmail,
  checkIsEmpty,
  confirmPasswordsEqual,
  formatNames
} = require('../utils/formatValidate')

exports.signUp = (req, res) => {
  const data = JSON.parse(req.body)

  // The req object body with user info.
  const userInfo = {
    userId: data.userId,
    programId: data.programId,
    totalWorkouts: data.totalWorkouts,
    firstName: data.firstName,
    password: data.password,
    confirmPassword: data.confirmPassword,
    email: data.email,
    biggestObstacle: data.biggestObstacle
  }

  // Format and validate userInfo
  let errors = {}

  const isFirstNameEmpty = checkIsEmpty(userInfo.firstName)
  const isPasswordEmpty = checkIsEmpty(userInfo.password)
  const isBiggestObstacleEmpty = checkIsEmpty(userInfo.biggestObstacle)
  const isEmailValid = checkIsEmail(userInfo.email)
  const passwordsEqual = confirmPasswordsEqual(
    userInfo.password,
    userInfo.confirmPassword
  )
  const formattedFirstName = formatNames(userInfo.firstName)

  if (isFirstNameEmpty) {
    errors.firstName = 'First name is blank.'
  }

  if (isPasswordEmpty) {
    errors.password = 'Password is blank.'
  }

  if (!isEmailValid) {
    errors.email = 'Email is not valid.'
  }

  if (!passwordsEqual) {
    errors.passwordsEqual = "Passwords don't match. Try again."
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
    userId: userInfo.userId,
    programId: userInfo.programId,
    totalWorkouts: userInfo.totalWorkouts,
    firstName: formattedFirstName,
    password: userInfo.password,
    email: userInfo.email.toLowerCase(),
    biggestObstacle: userInfo.biggestObstacle
  }

  // Step 1: Get newly created user
  auth.getUser(cleanUserInfo.userId).then(userCredential => {
    // Step 2: Does user already exist?
    const userId = userCredential.uid
    const baseAvatarImage = `https://firebasestorage.googleapis.com/v0/b/${prodConfig.storageBucket}/o/admin%2Ffww-user-avatar.png?alt=media`
    const baseAvatarImageTiny = `https://firebasestorage.googleapis.com/v0/b/${prodConfig.storageBucket}/o/admin%2Ffww-user-avatar-tiny.jpg?alt=media`

    db.collection('users')
      .doc(cleanUserInfo.userId)
      .get()
      .then(userDoc => {
        if (userDoc.exists) {
          // the user already exists. Return error.
          return res.status(400).json({
            error: `Account, already exists. Try again.`
          })
        } else {
          // Step 3: Updating user with cleaned and formatted data.
          // This is going into the user in Authentication
          return auth.updateUser(userId, {
            email: cleanUserInfo.email,
            password: cleanUserInfo.password,
            displayName: cleanUserInfo.firstName,
            photoURL: baseAvatarImage
          })
        }
      })
      .then(() => {
        // Step 4: Set customClaims on user to use with site access.
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
            // Custom claim created
            return
          })

        // Step 5: Create user document in database
        const userDoc = {
          userId: userId,
          firstName: cleanUserInfo.firstName,
          programs: [cleanUserInfo.programId],
          biggestObstacle: cleanUserInfo.biggestObstacle,
          createdAt: new Date().toLocaleDateString()
        }

        return db
          .collection('users')
          .doc(userDoc.userId)
          .set(userDoc)
      })
      .then(() => {
        // Step 6: Create user account document in database
        const accountsDoc = {
          firstName: cleanUserInfo.firstName,
          userId: userId,
          email: cleanUserInfo.email
        }

        return db
          .collection('accounts')
          .doc(cleanUserInfo.userId)
          .set(accountsDoc)
      })
      .then(() => {
        // Step 7: Create the Percent Complete doc so it's ready to show
        const percentComplete = {
          workoutsCompleted: 0,
          totalWorkouts: cleanUserInfo.totalWorkouts,
          programId: cleanUserInfo.programId
        }

        return db
          .collection('users')
          .doc(cleanUserInfo.userId)
          .collection('Programs')
          .doc(cleanUserInfo.programId)
          .set(percentComplete)
      })
      .then(() => {
        // Step 7: Return the new user and get them to the dashboard.
        const programArray = []
        programArray.push(cleanUserInfo.programId)

        return res.status(201).json({
          success: `💪 Account created. Congrats!`,
          firstName: cleanUserInfo.firstName,
          photoUrl: baseAvatarImage,
          photoUrlTiny: baseAvatarImageTiny,
          programs: programArray
          // initialSetup: true,
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
