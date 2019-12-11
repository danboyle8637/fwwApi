const fetch = require('node-fetch')

exports.isInConvertKit = email => {
  const ckApiKey = process.env.CONVERT_KIT_KEY
  const ckApiSecret = process.env.CONVERT_KIT_SECRET
  const ckBaseUrl = process.env.CONVERT_KIT_BASE_ENDPOINT
  const ckFindMemberUrl = `${ckBaseUrl}/subscribers?api_secret=${ckApiSecret}&email_address=${email}`

  return new Promise((resolve, reject) => {
    fetch(ckFindMemberUrl, {
      method: 'GET'
    })
      .then(response => response.json())
      .then(subscriberData => {
        const subscriberId = subscriberData.subscribers[0].id

        const getTagsUrl = `${ckBaseUrl}/subscribers/${subscriberId}/tags?api_key=${ckApiKey}`

        fetch(getTagsUrl, {
          method: 'GET'
        })
          .then(response => response.json())
          .then(tagData => {
            // if tags array is greater than 1
            const numberOfTags = tagData.tags.length

            if (numberOfTags > 1) {
              resolve(true)
            } else {
              resolve(false)
            }
          })
          .catch(error => {
            reject(error)
          })
      })
      .catch(error => {
        reject(error)
      })
  })
}
