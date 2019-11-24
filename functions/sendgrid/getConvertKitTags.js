require('dotenv').config({
  path: `.env`
})
const fetch = require('node-fetch')

exports.getConvertKitTags = (req, res) => {
  const apiKey = process.env.CONVERT_KIT_KEY
  const baseUrl = process.env.CONVERT_KIT_BASE_ENDPOINT

  const tagId = 1194502

  const url = `${baseUrl}/tags/${tagId}/subscribe`

  const reqBody = {
    api_key: apiKey,
    email: 'dan@fww.com',
    first_name: 'Dan'
  }

  const body = JSON.stringify(reqBody)

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: body
  })
    .then(response => response.json())
    .then(data => {
      console.log(data)
    })
    .catch(error => {
      console.log(error)
    })
}
