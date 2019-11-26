require('dotenv').config({
  path: `.env`
})
const fetch = require('node-fetch')
const { checkIsEmail, formatNames } = require('../utils/formatValidate')

exports.tempNotFinishSigningUp = (req, res) => {
  const apiKey = process.env.CONVERT_KIT_KEY
  const baseUrl = process.env.CONVERT_KIT_BASE_ENDPOINT

  const request = {
    firstName: req.body.firstName,
    email: req.body.email,
    biggestObstacle: req.body.biggestObstacle
  }

  const firstName = request.firstName
  const email = request.email.toLowerCase()
  const biggestObstacle = request.biggestObstacle
  const listTagsUrl = `${baseUrl}/tags?api_key=${apiKey}`

  const isEmail = checkIsEmail(email)
  const formattedFirstName = formatNames(firstName)

  if (!isEmail) {
    res.end()
  }

  // Get a list of the tags.
  fetch(listTagsUrl, {
    method: 'GET'
  })
    .then(response => response.json())
    .then(tagData => {
      const tagArray = tagData.tags
      const tempUserTag = tagArray.find(
        tag => tag.name === 'DidNotFinishResetSignUp'
      )
      const tagId = tempUserTag.id
      const subscribeProspectUrl = `${baseUrl}/tags/${tagId}/subscribe`

      const addProspectBody = {
        api_key: apiKey,
        first_name: formattedFirstName,
        email: email,
        fields: {
          biggest_obstacle: biggestObstacle
        }
      }

      const body = JSON.stringify(addProspectBody)

      fetch(subscribeProspectUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: body
      })
        .then(response => response.json())
        .then(() => res.end())
        .catch(() => res.end())
    })
    .catch(() => res.end())
}
