const storage = require('../utils/admin').storage
const auth = require('../utils/admin').auth
const path = require('path')
const os = require('os')
const fs = require('fs-extra')
const sharp = require('sharp')
const Busboy = require('busboy')

const config = require('../fbconfig')

exports.uploadProfileImage = (req, res) => {
  const { dirname, join } = path
  const { tmpdir } = os
  const userId = req.body.userId

  const busyboy = new Busboy({ headers: req.headers })
  const bucket = storage.bucket(config.storageBucket)

  let userEmailHandle
  let newAvatarName
  const functionWorkingDirectory = join(tmpdir(), 'avatar')
  const uploadDir = 'users/'
  let uploadData = {}

  auth
    .getUser('BhWZiGKHPYeoVELdo8D24jFA3rQ2')
    .then(user => {
      userEmailHandle = user.email.split('@')[0]
      newAvatarName = `new-avatar-${userEmailHandle}-300x300`
    })
    .catch(() => {
      res.status(500).json({
        message: 'Could not get user'
      })
    })

  busyboy.on('file', (fieldname, file, filename, mimetype) => {
    fs.ensureDir(functionWorkingDirectory)
      .then(() => {
        // This is the file path to the uploaded file
        const uploadedFilePath = join(functionWorkingDirectory, filename)
        // This is my file path that will be overwritten with the cropped image
        const tempRenamedFilePath = join(
          functionWorkingDirectory,
          newAvatarName
        )

        sharp(uploadedFilePath)
          .resize(300, 300)
          .toFile(tempRenamedFilePath)
          .then(() => {
            uploadData = {
              file: tempRenamedFilePath,
              type: mimetype
            }

            file.pipe(fs.createWriteStream(tempRenamedFilePath))
          })
      })
      .catch(() => {
        console.log('Temporary working directory does not exist.')
      })
  })

  busyboy.on('finish', () => {
    bucket.upload(uploadData.file, {
      destination: join(uploadDir, newAvatarName)
    })
  })

  busyboy.end(req.rawBody)

  return fs.remove(functionWorkingDirectory)
}
