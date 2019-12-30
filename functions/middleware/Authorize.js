const auth = require('../utils/admin').auth

exports.Authorize = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).json({
      message: `Not a current user. Go sign up first. It's free!`
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
      .catch(() => {
        return res
          .status(403)
          .json({ error: 'You did not pass authorization.' })
      })
  } else {
    return res.status(403).json({ error: 'You are not authorized.' })
  }
}
