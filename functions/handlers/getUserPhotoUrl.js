exports.getUserPhotoUrl = (req, res) => {
  const photoUrl = req.body.url

  return res.status(200).json({
    message: '😁 Image Uploaded!',
    photoUrl: photoUrl
  })
}
