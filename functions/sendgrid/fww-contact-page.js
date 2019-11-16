require('dotenv').config({
  path: `.env.development`
})
const sgMail = require('@sendgrid/mail')
const nodemailer = require('nodemailer')
const cors = require('cors')({ origin: true })

const { formatNames, checkIsEmail } = require('../utils/formatValidate')

sgMail.setApiKey(process.env.SEND_GRID_KEY)

let transporter = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    user: process.env.SEND_GRID_EMAIL,
    pass: process.env.SEND_GRID_PASSWORD
  }
})

exports = (req, res) => {
  return cors(req, res, () => {
    const subscriberInfo = {
      firstName: req.body.firstName,
      email: req.body.email,
      message: req.body.message
    }

    const subscriberName = formatNames(subscriberInfo.firstName)
    const isSubscriberEmailGood = checkIsEmail(subscriberInfo.email)

    const notifyEmailOptions = {
      to: 'kindal@fitwomensweekly.com',
      from: `Fit Women's Weekly <fitwomensweeklyhelp@gmail.com>`,
      subject: `📨 New Contact Form Submission 📨`,
      html: `<p>Somebody submitted our contact form.</p>
              <p>Here's the details:</p>
              <ul>
              <li>First Name: ${subscriberInfo.firstName}</li>
              <li>Email: ${subscriberInfo.email}</li>
              <li>Message: ${subscriberInfo.message}</li>
              </ul>
              <p>If it's important... Get Back To Them!</p>
              <p>Love - Fit Women's Weekly Robots.</p>
        `
    }
    const sendGridMsg = {
      to: subscriberInfo.email,
      from: 'kindal@fitwomensweekly.com',
      templateId: 'd-48aac554cc8241fa87930309baa78e3e',
      dynamic_template_data: {
        subject: 'I got your contact message 📬',
        firstName: subscriberName,
        message: subscriberInfo.message
      }
    }
    if (isSubscriberEmailGood) {
      // Send notification email
      transporter.sendMail(notifyEmailOptions, (error, info) => {
        if (error) {
          console.error('Error sending notification email.')
          return
        }
        console.log('Email notification sent.')
      })
      // Send SendGrid email
      sgMail
        .send(sendGridMsg)
        .then(() => {
          console.log('Email sent!')
          res
            .status(200)
            .json({ message: 'Success! I will contact you today!' })
        })
        .catch(error => {
          res.status(500).json({ error: error })
        })
    } else {
      res.status(400).json({ error: 'Please enter a valid email address.' })
    }
  })
}
