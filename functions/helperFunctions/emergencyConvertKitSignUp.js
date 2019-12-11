require('dotenv').config({
  path: `.env`
})
const fetch = require('node-fetch')

exports.emergencyConvertKitSignUp = requestBody => {
  const ckApiKey = process.env.CONVERT_KIT_KEY
  const ckBaseUrl = process.env.CONVERT_KIT_BASE_ENDPOINT
  const ckListTagsUrl = `${ckBaseUrl}/tags?api_key=${ckApiKey}`

  const ckReqBody = {
    api_key: ckApiKey,
    first_name: requestBody.firstName,
    email: requestBody.email,
    fields: {
      biggest_obstacle: requestBody.biggestObstacle
    }
  }

  return new Promise((resolve, reject) => {
    fetch(ckListTagsUrl, {
      method: 'GET'
    })
      .then(response => response.json())
      .then(tagData => {
        const tagArray = tagData.tags
        const newUserTag = tagArray.find(
          tag => tag.name === requestBody.programId
        )
        const tagId = newUserTag.id
        const subscribeUserUrl = `${ckBaseUrl}/tags/${tagId}/subscribe`

        fetch(subscribeUserUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(ckReqBody)
        })
          .then(response => response.json())
          .then(() => {
            resolve({
              message: `success`
            })
          })
          .catch(() => {
            reject({
              message:
                'There seems to be a network issue. Please contact us if you see this error message with the email you used to sign up. We will make sure your account is correct.'
            })
          })
      })
  })
}
