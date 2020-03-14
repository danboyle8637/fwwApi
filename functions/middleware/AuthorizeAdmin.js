require('dotenv').config({
  path: `.env`
})

exports.AuthorizeAdmin = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).json({
      message: `Not an admin. Get out of here!`
    })
  }

  const authorization = req.headers.authorization
  const tokenPresent = req.headers.authorization.startsWith('Bearer ')

  let tokenId

  if (authorization && tokenPresent) {
    tokenId = req.headers.authorization.split('Bearer ').pop()

    if (tokenId === process.env.AUTHORIZE_ADMIN_TOKEN) {
      return next()
    } else {
      return res.status(403).json({
        error: 'You are not admin. Get out!'
      })
    }
  } else {
    return res.status(403).json({ error: 'You are not authorized.' })
  }
}
