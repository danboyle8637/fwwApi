const fetch = require('node-fetch')

exports.isInConvertKit = email => {
  const ckApiSecret = process.env.CONVERT_KIT_SECRET
  const ckBaseUrl = process.env.CONVERT_KIT_BASE_ENDPOINT
  const ckFindMemberUrl = `${ckBaseUrl}/subscribers?api_secret=${ckApiSecret}&email_address=${email}`

  return new Promise((resolve, reject) => {
    fetch(ckFindMemberUrl, {
      method: 'GET'
    })
      .then(response => response.json())
      .then(subscriberData => {
        if (subscriberData.total_subscribers > 0) {
          resolve(true)
        } else {
          resolve(false)
        }
      })
      .catch(error => {
        reject(error)
      })
  })
}
