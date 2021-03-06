require('dotenv').config({
  path: `.env`
})
const sgMail = require('@sendgrid/mail')

exports.handleFWWContactPage = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'POST')

  sgMail.setApiKey(process.env.SEND_GRID_KEY)

  const data = JSON.parse(req.body)

  const request = {
    firstName: data.firstName,
    email: data.email,
    issue: data.issue,
    message: data.message
  }

  const firstName = request.firstName
  const email = request.email
  const issue = request.issue
  const message = request.message

  // Make the call to email kindal and a general email address too.

  const adminMessage = {
    to: 'kindal@fitwomensweekly.com',
    from: 'fww@fitwomensweekly.com',
    templateId: 'd-400748f5b02f4c729f9300d3ee0f6f62',
    dynamic_template_data: {
      firstName: firstName,
      email: email,
      issue: issue,
      message: message
    }
  }

  const userMessage = {
    to: email,
    from: 'kindal@fitwomensweekly.com',
    templateId: 'd-48aac554cc8241fa87930309baa78e3e',
    dynamic_template_data: {
      subject: 'Got your message... talk very soon!',
      firstName: firstName,
      message: message
    }
  }

  const admin = sgMail.send(adminMessage)
  const user = sgMail.send(userMessage)

  Promise.all([admin, user])
    .then(() => {
      res.status(200).json({
        message: 'Your message was sent! 💪'
      })
    })
    .catch(() => {
      res.status(200).json({
        message: `Message didn't send 😬. Try again!`
      })
    })
}
