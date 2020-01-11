require('dotenv').config({
  path: `.env`
})
const db = require('../../utils/admin').db
const fetch = require('node-fetch')

exports.setConvertKitProgramTag = (userId, programId) => {
  const apiKey = process.env.CONVERT_KIT_KEY
  const baseUrl = process.env.CONVERT_KIT_BASE_ENDPOINT

  return new Promise((resolve, reject) => {
    db.collection('accounts')
      .doc(userId)
      .get()
      .then(docSnapshot => {
        const email = docSnapshot.data().email
        const getTagsUrl = `${baseUrl}/tags?api_key=${apiKey}`

        fetch(getTagsUrl, {
          method: 'GET'
        })
          .then(response => response.json())
          .then(tagData => {
            const tag = tagData.tags.find(tag => tag.name === programId)
            const tagId = tag.id
            const addTagUrl = `${baseUrl}/tags/${tagId}/subscribe`

            const addTagBody = {
              api_key: apiKey,
              email: email
            }

            fetch(addTagUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(addTagBody)
            })
              .then(response => response.json())
              .then(() => {
                resolve('ConvertKit tag added')
              })
              .catch(error => {
                reject({
                  message: 'Could not add program tag to ConvertKit profile',
                  error
                })
              })
          })
          .catch(error => {
            reject({
              message: 'Could not get list of tags from Convert Kit',
              error
            })
          })
      })
      .catch(error => {
        reject({
          message: 'Could not get users account doc',
          error
        })
      })
  })
}
