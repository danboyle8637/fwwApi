const storage = require('../utils/admin').storage
const auth = require('../utils/admin').auth
const path = require('path')
const os = require('os')
const fs = require('fs')
const sharp = require('sharp')
const Busboy = require('busboy')
const uuid = require('uuid/v4')

const config = require('../fbconfig')

exports.ReviewImageUpload = (req, res, next) => {
  const userId = req.userId
  const bucket = storage.bucket(config.storageBucket)
  const busboy = new Busboy({ headers: req.headers })
  const token = uuid()
  const tmpdir = os.tmpdir()

  // This would be for fields that are submitted
  const fields = {}
  // This is for images
  const files = []
  const fileNames = []
  const fileWrites = []
  const errors = {}
  const username = []

  auth
    .getUser(userId)
    .then(user => {
      const userEmailHandle = user.email.split('@')[0]

      busboy.on('file', (fieldname, file, filename) => {
        const filepath = path.join(tmpdir, filename)
        const editedFilename = filename.split('.')[0]
        fileNames.push(editedFilename)

        const writeStream = fs.createWriteStream(filepath)
        file.pipe(writeStream)

        const promise = new Promise((resolve, reject) => {
          file.on('end', () => {
            writeStream.end()
          })
          writeStream.on('finish', resolve(filepath))
          writeStream.on('error', reject('Problem in writing the file'))
        })

        fileWrites.push(promise)
      })

      busboy.on('finish', () => {
        Promise.all(fileWrites)
          .then(files => {
            const image = files[0]
            const tmpFileName = `${userEmailHandle}-300x300-${fileNames[0]}`
            const tmpFilePath = path.join(tmpdir, tmpFileName)

            sharp(image)
              .jpeg({
                quality: 60,
                force: true
              })
              .resize(300, 300)
              .toFile(tmpFilePath)
              .then(() => {
                return bucket.upload(tmpFilePath, {
                  destination: `reviews/${tmpFileName}`,
                  resumable: false,
                  uploadType: 'media',
                  metadata: {
                    contentType: 'image/jpg',
                    metadata: {
                      firebaseStorageDownloadTokens: token
                    }
                  }
                })
              })
              .then(() => {
                try {
                  fs.unlinkSync(tmpFilePath)
                } catch (error) {
                  res.status(500).json({
                    message: 'Could not delete the temp file.'
                  })
                }

                const selfieUrl = `https://firebasestorage.googleapis.com/v0/b/fit-womens-weekly.appspot.com/o/reviews%2F${tmpFileName}?alt=media&token=${token}`

                req.body = {
                  userId: userId,
                  selfie: selfieUrl
                }

                next()
              })
              .catch(next)
          })
          .catch(next)
      })

      busboy.end(req.rawBody)
    })
    .catch(() => {
      return res.status(500).json({
        message: 'Could not get user',
        errors: errors
      })
    })
}
