require('dotenv').config({
  path: `.env`
})
const fetch = require('node-fetch')
const db = require('../utils/admin').db

exports.saveReview = (req, res) => {
  const apiKey = process.env.CONVERT_KIT_KEY
  const baseUrl = process.env.CONVERT_KIT_BASE_ENDPOINT

  const userId = req.selfie.userId
  const stars = req.selfie.review.reviewBody.stars
  const firstName = req.selfie.review.reviewBody.firstName
  const email = req.selfie.review.reviewBody.email
  const review = req.selfie.review.reviewBody.review
  const selfie = req.selfie.selfie

  const getTagsUrl = `${baseUrl}/tags?api_key=${apiKey}`

  const reviewData = {
    stars: stars,
    firstName: firstName,
    review: review,
    selfieUrl: selfie
  }

  db.collection('reviews')
    .doc(userId)
    .set(reviewData)
    .then(() => {
      fetch(getTagsUrl, {
        method: 'GET'
      })
        .then(response => response.json())
        .then(tagData => {
          const tag = tagData.tags.find(tag => tag.name === 'ResetReviewer')
          const tagId = tag.id
          const addConvertKitTagUrl = `${baseUrl}/tags/${tagId}/subscribe`

          const addTagBody = {
            api_key: apiKey,
            email: email
          }

          fetch(addConvertKitTagUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(addTagBody)
          })
            .then(response => response.json())
            .then(() => {
              res.status(200).json({
                message: 'Review saved and ConvertKit tag added.'
              })
            })
            .catch(() => {
              res.status(500).json({
                message: 'ConvertKit tag could not be added.'
              })
            })
        })
        .catch(() => {
          res.status(500).json({
            message: 'Could not get ConvertKit tags'
          })
        })
    })
    .catch(() => {
      res.status(500).json({
        message: 'Could not save the review.'
      })
    })
}
