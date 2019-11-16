const storage = require('../utils/admin').storage
const auth = require('../utils/admin').auth
const path = require('path')
const os = require('os')
const fs = require('fs')
const sharp = require('sharp')
const Busboy = require('busboy')

const config = require('../fbconfig')

exports = (req, res) => {
  const bucket = storage.bucket(config.storageBucket)
  const busboy = new Busboy({ headers: req.headers })

  auth
    .getUser('BhWZiGKHPYeoVELdo8D24jFA3rQ2')
    .then(user => {
      const userEmailHandle = user.email.split('@')[0]
      const workingDirectory = path.join(os.tmpdir(), 'image')
      const updatedFileName = `fww-avatar-${userEmailHandle}-300x300`
      const filePath = path.join(workingDirectory, updatedFileName)
      const resizedFilePath = path.join(workingDirectory, 'avatar.jpg')

      busboy.on('file', (fieldname, file, filename, mimetype) => {
        console.log(fieldname)
        console.log(filename)
        //const saveTo = path.join(workingDirectory, )
        file.pipe(fs.createWriteStream(filePath))
      })

      // busboy.on('finish', () => {
      //   sharp(filePath)
      //     .resize(300, 300)
      //     .toFile(resizedFilePath)
      //     .then(() => {
      //       bucket
      //         .upload(filePath, {
      //           destination: 'users/',
      //           resumable: false,
      //           gzip: true
      //         })
      //         .then(() => {
      //           console.log('Image should be uploaded')
      //           fs.rmdir(workingDirectory)
      //         })
      //         .catch(error => {
      //           return res.send(error)
      //         })
      //     })
      //     .catch(error => {
      //       console.log('Sharp Error')
      //       console.log(error)
      //     })
      // })

      // busboy.end()

      return res.status(201).json({
        message: 'Image should be resized and uploaded'
      })
    })
    .catch(() => {
      return res.send('No user')
    })
}
