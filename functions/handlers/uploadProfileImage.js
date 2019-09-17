const storage = require('../utils/admin').storage
const auth = require('../utils/admin').auth

const config = require('../fbconfig')

exports.uploadProfileImage = (req, res) => {
  const BusBoy = require('busboy')
  const os = require('os')
  const path = require('path')
  const fs = require('fs')

  const busboy = new BusBoy({
    headers: req.headers
  })
  const tempdir = os.tmpdir()
  const userDisplayName = req.user.displayName

  let imageFileName
  let imageToUpload

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    const imageExtension = filename.split('.').pop()

    if (mimetype !== 'image/png' || mimetype !== 'image/jpeg') {
      return res.status(400).json({ error: 'Image must be a jpg or png file' })
    }

    imageFileName = `avatar_${userDisplayName}.${imageExtension}`

    // imageFileName = `${Math.round(
    //   Math.random() * 1000000000
    // )}.${imageExtension}`

    // Temporarty holding location(path) for our image file
    const filePath = path.join(tempdir, imageFileName)

    // Create the image to upload
    imageToUpload = { filePath: filePath, mimetype: mimetype }

    const writeStream = fs.createWriteStream(filePath)
    file.pipe(writeStream)
  })

  busboy.on('finish', () => {
    storage
      .bucket()
      .upload(imageToUpload.filePath, {
        destination: `users/${imageFileName}`,
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToUpload.mimetype
          }
        }
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/users%2F${imageFileName}?alt=media`

        // Protected route so it will have the user when it's called.
        // This will give you the uid to update the user.
        const uid = req.user.uid
        return auth
          .updateUser(uid, {
            photoURL: imageUrl
          })
          .then(userRecord => {
            const profileUrl = userRecord.photoURL
            res.status(201).json({
              success: 'User profile successfully updated with new photoUrl.',
              url: profileUrl
            })
          })
          .catch(error => {
            res.status(500).json({
              error: 'User profile was not updated with new photoUrl',
              error: error
            })
          })
      })
      .catch(error => {
        res.status(500).json({
          errorMessage: 'File not uploaded to cloud storage.',
          error: error
        })
      })
  })

  busboy.end(req.rawBody)
}
