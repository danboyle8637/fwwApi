const storage = require('../utils/admin').storage
const auth = require('../utils/admin').auth
const path = require('path')
const os = require('os')
const fs = require('fs')
const sharp = require('sharp')
const Busboy = require('busboy')

const config = require('../fbconfig')

exports.uploadProfileImage = (req, res) => {
  const bucket = storage.bucket(config.storageBucket)
  const busboy = new Busboy({ headers: req.headers })
  const tmpdir = os.tmpdir()

  // This would be for fields that are submitted
  const fields = {}
  // This is for images
  const fileNames = []
  const fileWrites = []

  auth
    .getUser('BhWZiGKHPYeoVELdo8D24jFA3rQ2')
    .then(user => {
      const userEmailHandle = user.email.split('@')[0]
      // const workingDirectory = path.join(tmpdir, 'image')

      busboy.on('file', (fieldname, file, filename) => {
        const filepath = path.join(tmpdir, filename)
        fileNames.push(filename)

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
        console.log(fileWrites)
        Promise.all(fileWrites)
          .then(files => {
            const image = files[0]
            const tmpFileName = `${userEmailHandle}-300x300-${fileNames[0]}`
            console.log(tmpFileName)
            const tmpFilePath = path.join(tmpdir, tmpFileName)

            sharp(image)
              .jpeg({
                quality: 60,
                force: true
              })
              .resize(300, 300)
              .toFile(tmpFilePath)
              .then(data => {
                console.log(data)
                bucket
                  .upload(tmpFilePath, {
                    destination: `users/${tmpFileName}`
                  })
                  .then(() => {
                    return res.status(200).json({
                      message: 'Image uploaded!'
                    })
                  })
                  .catch(() => {
                    return res.status(500).json({
                      message: 'Image not uploaded'
                    })
                  })
              })
              .catch(() => {
                res.status(500).json({
                  message: 'Image could not be resized.'
                })
              })
          })
          .catch(error => {
            console.log(error)
          })
      })

      busboy.end(req.rawBody)
    })
    .catch(() => {
      return res.send('No user')
    })
}
