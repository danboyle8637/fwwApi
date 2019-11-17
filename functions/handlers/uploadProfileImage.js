const storage = require('../utils/admin').storage
const auth = require('../utils/admin').auth
const path = require('path')
const os = require('os')
const fs = require('fs')
const sharp = require('sharp')
const Busboy = require('busboy')
const uuid = require('uuid/v4')

const config = require('../fbconfig')

exports.uploadProfileImage = (req, res) => {
  const userId = req.userId
  const bucket = storage.bucket(config.storageBucket)
  const busboy = new Busboy({ headers: req.headers })
  const token = uuid()
  const tmpdir = os.tmpdir()

  // This would be for fields that are submitted
  const fields = {}
  // This is for images
  const fileNames = []
  const fileWrites = []
  const errors = {}

  auth
    .getUser(userId)
    .then(user => {
      const userEmailHandle = user.email.split('@')[0]
      // const workingDirectory = path.join(tmpdir, 'image')

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
                bucket
                  .upload(tmpFilePath, {
                    destination: `users/${tmpFileName}`,
                    resumable: false,
                    uploadType: 'media',
                    metadata: {
                      contentType: 'image/png',
                      metadata: {
                        firebaseStorageDownloadTokens: token
                      }
                    }
                  })
                  .then(() => {
                    auth
                      .updateUser(user.uid, {
                        photoURL: `https://firebasestorage.googleapis.com/v0/b/fit-womens-weekly.appspot.com/o/users%2F${tmpFileName}.jpg?alt=media&token=${token}`
                      })
                      .then(() => {
                        // Delete files in tmpdir
                        fs.readdirSync(tmpdir).forEach(file => {
                          console.log(file)
                        })
                      })
                      .catch(() => {
                        errors['error'] = 'Could not update user'
                      })
                  })
                  .catch(() => {
                    erros['error'] = 'Image not uploaded'
                  })
              })
              .catch(() => {
                errors['error'] = 'Image could not be resized'
              })
          })
          .catch(() => {
            errors['error'] = 'Could not resolve saving files to temp directory'
          })
      })

      busboy.end(req.rawBody)

      return res.status(200).json({
        message: 'Image uploaded!',
        photoUrl: user.photoURL
      })
    })
    .catch(() => {
      return res.status(500).json({
        message: 'Image not uploaded',
        errors: errors
      })
    })
}
