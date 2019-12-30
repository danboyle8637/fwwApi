require('dotenv').config({
  path: `.env`
})
const admin = require('firebase-admin')
const prodServiceAccount = require('../service-account.json')
const devServiceAccount = require('../service-account-dev.json')

const serviceAccount =
  process.env.API_STAGE === 'development'
    ? devServiceAccount
    : prodServiceAccount

const firebaseProduction = process.env.FB_PROD_DATABASE_URL
const firebaseDevelopment = process.env.FB_DEV_DATABASE_URL

const databaseUrl =
  process.env.API_STAGE === 'development'
    ? firebaseDevelopment
    : firebaseProduction

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: databaseUrl
})

const db = admin.firestore()
const auth = admin.auth()
const storage = admin.storage()

module.exports = { admin, db, auth, storage }
