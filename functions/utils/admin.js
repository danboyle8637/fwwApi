require('dotenv').config({
  path: `.env.development`
})
const admin = require('firebase-admin')
const serviceAccount = require('../service-account.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
})

const db = admin.firestore()
const auth = admin.auth()
const storage = admin.storage()

module.exports = { admin, db, auth, storage }
