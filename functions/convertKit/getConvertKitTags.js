require('dotenv').config({
  path: `.env`
})
const fetch = require('node-fetch')
const { checkIsEmail, formatNames } = require('../utils/formatValidate')

exports.getConvertKitTags = (req, res) => {
  const apiKey = process.env.CONVERT_KIT_KEY
  const baseUrl = process.env.CONVERT_KIT_BASE_ENDPOINT

  const request = {
    firstName: req.body.firstName,
    email: req.body.email,
    program: req.body.program,
    biggestObstacle: req.body.biggestObstacle
  }

  const firstName = request.firstName
  const email = request.email
  const program = request.program
  const biggestObstacle = request.biggestObstacle

  const isEmail = checkIsEmail(email)
  const formattedEmail = email.toLowerCase()
  const formattedName = formatNames(firstName)

  const listTagsUrl = `${baseUrl}/tags?api_key=${apiKey}`
  let reqBody = {}

  if (isEmail) {
    reqBody = {
      api_key: apiKey,
      first_name: formattedName,
      email: formattedEmail,
      fields: {
        biggest_obstacle: biggestObstacle
      }
    }
  } else {
    res.status(400).json({
      message: 'Invalid email address.'
    })
  }

  const body = JSON.stringify(reqBody)

  fetch(listTagsUrl, {
    method: 'GET'
  })
    .then(response => response.json())
    .then(tagData => {
      const tagArray = tagData.tags
      const newUserTag = tagArray.find(tag => tag.name === program)
      const tagId = newUserTag.id
      const subscribeUserUrl = `${baseUrl}/tags/${tagId}/subscribe`

      fetch(subscribeUserUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: body
      })
        .then(response => response.json())
        .then(data => {
          res.status(200).json({
            message: `Added to ${program} tag`
          })
        })
        .catch(() => {})
    })
    .catch(error => {
      console.log(error)
      res.status(500).json({
        message: 'Could not add to our list'
      })
    })
}
