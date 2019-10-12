const db = require('../utils/admin').db
const auth = require('../utils/admin').auth

const config = require('../fbconfig')
const {
  checkIsEmail,
  checkIsEmpty,
  cleanAndCheckUsername,
  confirmPasswordsEqual,
  formatNames
} = require('../utils/formatValidate')

exports.signUp = (req, res) => {
  const data = JSON.parse(req.body)

  // The req object body with user info.
  const userInfo = {
    userId: data.userId,
    program: data.program,
    totalWorkouts: data.totalWorkouts,
    firstName: data.firstName,
    username: data.username,
    password: data.password,
    confirmPassword: data.confirmPassword,
    email: data.email
  }

  // Format and validate userInfo
  let errors = {}

  const isFirstNameEmpty = checkIsEmpty(userInfo.firstName)
  const isPasswordEmpty = checkIsEmpty(userInfo.password)
  const isEmailValid = checkIsEmail(userInfo.email)
  const passwordsEqual = confirmPasswordsEqual(
    userInfo.password,
    userInfo.confirmPassword
  )
  const formattedFirstName = formatNames(userInfo.firstName)
  const formattedUsername = cleanAndCheckUsername(userInfo.username)

  if (isFirstNameEmpty) {
    errors.firstName = 'Please enter your first name.'
  }

  if (formattedUsername === false) {
    errors.username = 'Please check your username.'
  }

  if (isPasswordEmpty) {
    errors.password = 'Please create a password.'
  }

  if (!isEmailValid) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!passwordsEqual) {
    errors.passwordsEqual = "Passwords don't match. Try again."
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: 'Input validation errors',
      errors: errors
    })
  }

  const cleanUserInfo = {
    userId: userInfo.userId,
    program: userInfo.program,
    totalWorkouts: data.totalWorkouts,
    firstName: formattedFirstName,
    username: formattedUsername,
    password: userInfo.password,
    email: userInfo.email.toLowerCase()
  }

  // Step 1: Get newly created user
  auth.getUser(cleanUserInfo.userId).then(userCredential => {
    // Step 2: Does username already exist?
    const userId = userCredential.uid
    const baseAvatarImage = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/admin%2Ffww-user-avatar.png?alt=media`

    db.collection('users')
      .doc(cleanUserInfo.username)
      .get()
      .then(userDoc => {
        if (userDoc.exists) {
          // the username already exists. Return error.
          return res.status(400).json({
            error: `Username, ${cleanUserInfo.username}, already exists. Try a different version or create a new one.`
          })
        } else {
          // Step 3: Updating user with cleaned and formatted data.

          return auth.updateUser(userId, {
            email: cleanUserInfo.email,
            password: cleanUserInfo.password,
            displayName: cleanUserInfo.username,
            photoURL: baseAvatarImage
          })
        }
      })
      .then(() => {
        // Step 4: Set customClaims on user to use with site access.
        auth
          .setCustomUserClaims(userId, {
            program: [cleanUserInfo.program],
            free: true
          })
          .then(() => {
            console.log('Custom claim created.')
            return
          })

        // Step 5: Create user document in database
        const userDoc = {
          userId: userId,
          firstName: cleanUserInfo.firstName,
          username: cleanUserInfo.username,
          programs: [cleanUserInfo.program],
          createdAt: new Date().toISOString()
        }

        return db
          .collection('users')
          .doc(userDoc.username)
          .set(userDoc)
      })
      .then(() => {
        // Step 6: Create user account document in database
        const accountsDoc = {
          userId: userId,
          email: cleanUserInfo.email
        }

        return db
          .collection('accounts')
          .doc(cleanUserInfo.username)
          .set(accountsDoc)
      })
      .then(() => {
        // Step 7: Create the Percent Complete doc so it's ready to show
        const percentComplete = {
          workoutsCompleted: 0,
          totalWorkouts: cleanUserInfo.totalWorkouts,
          programId: cleanUserInfo.program,
          title: 'PercentComplete'
        }

        return db
          .collection('users')
          .doc(cleanUserInfo.username)
          .collection(cleanUserInfo.program)
          .doc('PercentComplete')
          .set(percentComplete)
      })
      .then(() => {
        // Step 7: Return the new user and get them to the dashboard.
        const programArray = []
        programArray.push(cleanUserInfo.program)

        return res.status(201).json({
          success: `New user ${userId} successfully created and saved.`,
          firstName: cleanUserInfo.firstName,
          username: cleanUserInfo.username,
          photoUrl: baseAvatarImage,
          programs: programArray
        })
      })
      .catch(error => {
        console.log('Error is firing for some reason')
        return res.status(500).json({ error: error })
      })
  })
}
