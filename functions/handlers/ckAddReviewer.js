// Add a reviewer to special list that will get discounts
require('dotenv').config({
  path: `.env`
})
const fetch = require('node-fetch')
const { checkIsEmail, formatNames } = require('../utils/formatValidate')

exports.ckAddReviewer = (req, res) => {
  const apiKey = process.env.CONVERT_KIT_KEY
  const baseUrl = process.env.CONVERT_KIT_BASE_ENDPOINT

  const request = {
    firstName: req.body.firstName,
    email: req.body.email
  }

  const formattedFirstName = formatNames(request.firstName)
  const email = request.email.toLowerCase()
  const isEmail = checkIsEmail(request.email)
  const listTagsUrl = `${baseUrl}/tags?api_key=${apiKey}`

  if (!isEmail) {
    return res.end()
  }

  fetch(listTagsUrl, {
    method: 'GET'
  })
    .then(response => response.json())
    .then(tagData => {
      const tagArray = tagData.tags
      const tempUserTag = tagArray.find(tag => tag.name === 'ResetReviewer')
      const tagId = tempUserTag.id
      const subscribeProspectUrl = `${baseUrl}/tags/${tagId}/subscribe`

      const addProspectBody = {
        api_key: apiKey,
        first_name: formattedFirstName,
        email: email
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
