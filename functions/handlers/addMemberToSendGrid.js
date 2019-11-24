require('dotenv').config({
  path: `.env`
})
const fetch = require('node-fetch')

exports.addMemberToSendGrid = (req, res) => {
  const apiKey = process.env.SEND_GRID_API_KEY
  //const data = JSON.parse(req.body)
  const baseUrl = 'https://api.sendgrid.com/v3'
  const getListUrl = `${baseUrl}/marketing/lists`
  const addContactUrl = `${baseUrl}/marketing/contacts`

  const reqObj = {
    firstName: req.body.firstName,
    email: req.body.email,
    program: req.body.program
  }

  // TODO Format the data so it's in the right casing
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

      const addToList = listArray.find(list => list.name.includes(program))

      const body = {
        list_ids: [addToList.id, '753d2a7d-bf87-4722-aa42-019cbf0a8f79'],
        contacts: [
          {
            first_name: firstName,
            email: email
          }
        ]
      }

      const sendGridBody = JSON.stringify(body)

      fetch(addContactUrl, {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: sendGridBody
      })
        .then(response => response.json())
        .then(data => {
          console.log(data)
          res.status(200).json({
            message: 'Added to list'
          })
        })
        .catch(() => {
          res.status(500).json({
            message: 'Failed to add to list'
          })
        })
    })
    .catch(error => {
      console.log(error)
    })
}
