const auth = require('../utils/admin').auth

exports.Authorize = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).json({
      error: 'Not a current user.'
    })
  }

  const authorization = req.headers.authorization
  const tokenPresent = req.headers.authorization.startsWith('Bearer ')

  let tokenId

  if (authorization && tokenPresent) {
    tokenId = req.headers.authorization.split('Bearer ').pop()

    auth
      .verifyIdToken(tokenId)
      .then(decodedToken => {
        req.userId = decodedToken.uid
        return next()
      })
      .catch(error => {
        return res
          .status(403)
          .json({ error: 'You did not pass authorization.' })
      })
  } else {
    return res.status(403).json({ error: 'You are not authorized.' })
  }
}
