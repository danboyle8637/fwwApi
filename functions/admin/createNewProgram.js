const db = require('../utils/admin').db

exports.createNewProgram = (req, res) => {
  const requestBody = {
    benefits: req.body.benefits,
    coverImage: req.body.coverImage,
    description: req.body.description,
    duration: req.body.duration,
    fitnessLevel: req.body.fitnessLevel,
    name: req.body.name,
    order: req.body.order,
    paid: req.body.paid,
    price: req.body.price,
    programId: req.body.programId,
    salesVideo: req.body.salesVideo,
    tinyCoverImage: req.body.tinyCoverImage,
    totalWorkouts: req.body.totalWorkouts
  }

  const benefits = requestBody.benefits
  const coverImage = requestBody.coverImage
  const description = requestBody.description
  const duration = requestBody.duration
  const fitnessLevel = requestBody.fitnessLevel
  const name = requestBody.name
  const order = requestBody.order
  const paid = requestBody.paid
  const price = requestBody.price
  const programId = requestBody.programId
  const salesVideo = requestBody.salesVideo
  const tinyCoverImage = requestBody.tinyCoverImage
  const totalWorkouts = requestBody.totalWorkouts

  const program = {
    benefits,
    coverImage,
    description,
    duration,
    fitnessLevel,
    name,
    order,
    paid,
    price,
    programId,
    salesVideo,
    tinyCoverImage,
    totalWorkouts
  }

  db.collection('programs')
    .doc(programId)
    .set(program)
    .then(() => {
      return res.status(201).json({
        message: `Success! ${name} setup correctly in the database`
      })
    })
    .catch(() => {
      return res.status(500).json({
        message: `Error. Could not write data to database.`
      })
    })
}
