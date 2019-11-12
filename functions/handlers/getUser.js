const db = require("../utils/admin").db;
const auth = require("../utils/admin").auth;

exports.getUser = (req, res) => {
  const userId = req.userId;

  db.collection("users")
    .doc(userId)
    .get()
    .then(userDoc => {
      const userExists = userDoc.exists();

      if (userExists) {
        const userData = userDoc.data();

        return res.status(200).json({
          message: "Successfully got user",
          firstName: userData.firstName,
          programs: userData.programs,
          photoUrl: userData.photoUrl
        });
      } else {
        auth.deleteUser(userId).then(() => {
          res.status(400).json({
            message: "Not a member yet. Sign Up!",
            error: "not-member"
          });
        });
      }
    })
    .catch(error => {
      return res.status(500).json({
        message: "User not found.",
        error: error
      });
    });
};
