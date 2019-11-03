const storage = require('../utils/admin').storage
const auth = require('../utils/admin').auth
const path = require('path')
const os = require('os')
const fs = require('fs')
const sharp = require('sharp')
const Busboy = require('busboy')

const config = require('../fbconfig')

exports.uploadProfileImage = (req, res) => {
  const { dirname, join } = path
  const { tmpdir } = os
  const userId = req.userId

  const busyboy = new Busboy({ headers: req.headers })
  const bucket = storage.bucket(config.storageBucket)

  let imageUpload
  const fileWrites = []
  let userEmailHandle
  let newAvatarName

  auth
    .getUser(userId)
    .then(user => {
      userEmailHandle = user.email.split('@')[0]
      newAvatarName = `new-avatar-${userEmailHandle}-300x300`
    })
    .catch(error => {
      res.status(500).json({
        message: 'Could not get user'
      })
    })

  busyboy.on('file', (fieldname, file, filename, mimetype) => {
    const filePath = join(tmpdir, filename)
    imageUpload = filePath

    const writeStream = fs.createWriteStream(filePath)
    file.pipe(writeStream)

    const promise = new Promise((resolve, reject) => {
      file.on('end', () => {
        writeStream.end()
      })
      writeStream.on('finish', resolve)
      writeStream.on('error', reject)
    })
    fileWrites.push(promise)
  })

  busyboy.on('finish', () => {
    Promise.all(fileWrites).then(() => {
      const resizedImage = sharp(file).resize(300, 300)

      // https://sharp.pixelplumbing.com/en/stable/api-constructor/
      // https://www.youtube.com/watch?v=OKW8x8-qYs0
      // https://firebase.google.com/docs/auth/admin/manage-users

      fs.unlinkSync(imageUpload)
    })
  })

  busyboy.end(req.rawBody)

  // // Create temporary working directory
  // const workingDirectory = join(tmpdir(), 'thumbnail')
  // // Create temporary file path
  // const tempFilePath = join(workingDirectory, 'source.jpg')
  // const newAvatarName = ``

  // const bucket = storage.bucket(config.storageBucket)

  // const resizedImage = sharp(newImage).resize(300, 300).toF
}
