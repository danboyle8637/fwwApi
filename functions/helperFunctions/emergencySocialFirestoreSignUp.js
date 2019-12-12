const db = require('../utils/admin').db
const auth = require('../utils/admin').auth

exports.emergencySocialFirestoreSignUp = requestBody => {
  const cleanUserInfo = {
    userId: requestBody.userId,
    programId: requestBody.programId,
    totalWorkouts: requestBody.totalWorkouts,
    firstName: formattedFirstName,
    email: requestBody.email.toLowerCase(),
    biggestObstacle: requestBody.biggestObstacle,
    photoUrl: photoURL
  }

  return new Promise((resolve, reject) => {
    // Step 1: Get newly created user
    auth.getUser(cleanUserInfo.userId).then(userCredential => {
      // Step 2: Does user already exist?
      const userId = userCredential.uid

      db.collection('users')
        .doc(userId)
        .get()
        .then(userDoc => {
          if (userDoc.exists) {
            // the user already exists. Return error.
            const error = {
              status: 400,
              error: `Account already exists. Login or if this seems incorrect, contact us with the email address you used to sign up so we can get this figured out for you.`
            }
            reject(error)
          } else {
            // Step 3: Updating user with cleaned and formatted data.
            // This is going into the user in Authentication
            auth
              .updateUser(userId, {
                email: cleanUserInfo.email,
                password: cleanUserInfo.password,
                displayName: cleanUserInfo.firstName,
                photoURL: cleanUserInfo.photoUrl
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
                  .then(() => {})
                  .catch(() => 'error')

                // Step 5: Create user document in database
                const userDoc = {
                  userId: userId,
                  firstName: cleanUserInfo.firstName,
                  programs: [cleanUserInfo.programId],
                  biggestObstacle: cleanUserInfo.biggestObstacle,
                  createdAt: new Date().toLocaleDateString()
                }

                db.collection('users')
                  .doc(userDoc.userId)
                  .set(userDoc)
                  .then(() => {
                    // Step 6: Create user account document in database
                    const accountsDoc = {
                      firstName: cleanUserInfo.firstName,
                      userId: userId,
                      email: cleanUserInfo.email
                    }

                    db.collection('accounts')
                      .doc(cleanUserInfo.userId)
                      .set(accountsDoc)
                      .then(() => {
                        // Step 7: Create the Percent Complete doc so it's ready to show
                        const percentComplete = {
                          workoutsCompleted: 0,
                          totalWorkouts: cleanUserInfo.totalWorkouts,
                          programId: cleanUserInfo.programId
                        }

                        db.collection('users')
                          .doc(cleanUserInfo.userId)
                          .collection('Programs')
                          .doc(cleanUserInfo.programId)
                          .set(percentComplete)
                          .then(() => {
                            // Step 7: Return the new user and get them to the dashboard.
                            const programArray = []
                            programArray.push(cleanUserInfo.programId)

                            const success = {
                              status: 200,
                              success: `💪 Account created. Congrats!`,
                              firstName: cleanUserInfo.firstName,
                              photoUrl: baseAvatarImage,
                              photoUrlTiny: baseAvatarImageTiny,
                              programs: programArray
                            }

                            resolve(success)
                          })
                          .catch(() => {
                            reject(
                              'Could not create your account. Please contact us.'
                            )
                          })
                      })
                      .catch(() => {
                        reject(
                          'Could not create your account. Please contact us.'
                        )
                      })
                  })
                  .catch(() => {
                    reject('Could not create your account. Please contact us.')
                  })
              })
              .catch(error => {
                const errorObj = {
                  status: 500,
                  message: `😢 A network or server error prevented us from setting your account up. This is important. Logout of the app and log back in. If you can't see your programs... contact us immediately!`,
                  error: error
                }
                reject(errorObj)
              })
          }
        })
        .catch(() => {
          reject('Could not access the database. Please contact us.')
        })
    })
  })
}
