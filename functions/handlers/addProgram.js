require('dotenv').config({
  path: `.env`
})
const auth = require('../utils/admin').auth
const admin = require('../utils/admin').admin
const db = require('../utils/admin').db
const fetch = require('node-fetch')

exports.addProgram = (req, res) => {
  const data = JSON.parse(req.body)

  const apiKey = process.env.CONVERT_KIT_KEY
  const baseUrl = process.env.CONVERT_KIT_BASE_ENDPOINT

  const request = {
    programId: data.programId
  }

  const userId = req.userId
  const programId = request.programId
  const updatedProgramArray = []

  const userAccount = db.collection('accounts').doc(userId)
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
        .then(() => {
          user
            .get()
            .then(userSnapshot => {
              const programsArray = userSnapshot.data().programs
              updatedProgramArray.push(...programsArray)
              getUserEmail()
                .then(emailAddress => {
                  const getTagsUrl = `${baseUrl}/tags?api_key=${apiKey}`

                  fetch(getTagsUrl, {
                    method: 'GET'
                  })
                    .then(response => response.json())
                    .then(tagData => {
                      const tag = tagData.tags.find(
                        tag => tag.name === programId
                      )
                      const tagId = tag.id
                      const addConvertKitTagUrl = `${baseUrl}/tags/${tagId}/subscribe`

                      const addTagBody = {
                        api_key: apiKey,
                        email: emailAddress
                      }

                      fetch(addConvertKitTagUrl, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(addTagBody)
                      })
                        .then(response => response.json())
                        .then(() => {
                          setNewProgram()
                        })
                        .catch(() => {
                          res.status(500).json({
                            message: `Could not add program tag to account. Try again.`
                          })
                        })
                    })
                    .catch(() => {
                      res.status(500).json({
                        message: `Could not get tagId to add to account. Try again.`
                      })
                    })
                })
                .catch(() => {
                  res.status(500).json({
                    message: 'Could not get email address. Try again.'
                  })
                })
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

  const getUserEmail = () => {
    return new Promise((resolve, reject) => {
      userAccount
        .get()
        .then(docSnapshot => {
          const emailAddress = docSnapshot.data().email
          resolve(emailAddress)
        })
        .catch(() => {
          reject('no email')
        })
    })
  }
}
