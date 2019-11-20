exports.getUserPhotoUrl = (req, res) => {
  const userId = req.body.userId
  const photoUrl = req.body.url

  res.status(200).json({
    message: '😁 Image Uploaded!',
    photoUrl: photoUrl
  })
}
