<p align="center">
  <img width="150" src="https://www.dropbox.com/s/w6b4fzuxw7i71b5/fww-readme-logo.jpg">
</p>

# Fit Women's Weekly Reset API

The Fit Women's Reset api was created to keep the Firebase SDK out of the client React app.

I wanted the bundle size small... I also didn't need any real time abilities... so it made sense to create an API using Google Cloud Functions to talk to my database.

This does add one more layer of potential cost...

Anytime I get data from the database, I not only incure the read or write to Google Firestore, but I incur the function invocation. Yet, I feel this is a good tradeoff.

### Express

I used Express to create my endpoints.

This api uses authorization middleware and some custom middleware to resize uploaded profile images.

Because it's built on a Google Function... there is no caching ability. However, I deployed the api using Firebase Hosting which has a built in CDN so I can cache common requests for short period of time.

### Google Cloud Run

Eventually I will convert this to a small node app... containerize it... and use Cloud Run to "host" it. This will automatically allow for scalling and tear down based on need. And I will be able to utilize some server based caching if I want.

### External APIs

- ConvertKit
- Sendgrid
- Stripe

### Technologies Used

- Google Cloud Functions
- Node/Express
- Sharp for image manipulation
- Google Firebase Hosting
