require('dotenv').config({
  path: `.env`
})
const fetch = require('node-fetch')

exports.handleAddContactToSendGrid = (req, res) => {
  const apiKey = process.env.SEND_GRID_API_KEY
  const baseUrl = 'https://api.sendgrid.com/v3'
  const getListUrl = `${baseUrl}/marketing/lists`
  const addContactUrl = `${baseUrl}/marketing/contacts`

  const reqObj = {
    firstName: req.body.firstName,
    email: req.body.email,
    program: req.body.program
  }

  const firstName = reqObj.firstName
  const email = reqObj.email
  const program = reqObj.program

  fetch(getListUrl, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.json())
    .then(data => {
      const listArray = data.result

      const addToList = listArray.filter(list => list.name.includes(program))

      const body = {
        list_ids: [addToList[0].id],
        contacts: [
          {
            first_name: firstName,
            email: email
          }
        ]
      }

      body.contacts[`${program}`] = program

      const reqBody = JSON.stringify(body)

      fetch(addContactUrl, {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: reqBody
      })
        .then(response => response.json())
        .then(data => {
          console.log(data)
          res.status(200).json({
            message: 'Contact added to list'
          })
        })
        .catch(error => {
          console.log(error)
          res.status(500).json({
            message: 'Contact not added to list'
          })
        })
    })
    .catch(() => {
      res.status(500).json({
        message: 'Could not get the lists'
      })
    })
}
