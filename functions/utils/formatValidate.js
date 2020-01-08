const emailValidationRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

exports.checkIsEmail = emailString => {
  const lowercaseEmail = String(emailString.toLowerCase())
  return emailValidationRegex.test(lowercaseEmail)
}

// Returns true if it's empty
// Retures false if it's not empty

exports.checkIsEmpty = inputData => {
  const stringData = String(inputData)
  const cleanData = stringData.trim()
  return cleanData.length === 0
}

// username must be more than 4 characters
// username can't be more than 12 characters
// username must be all lowercase

exports.cleanAndCheckUsername = username => {
  const usernameString = String(username)
  const lowerCaseUsername = usernameString.toLowerCase()
  const length = lowerCaseUsername.length
  let isGood
  if (length < 4 || length > 12) {
    isGood = false
  } else {
    isGood = true
  }

  if (isGood) {
    return lowerCaseUsername
  } else {
    return false
  }
}

// Returns true if the passwords are equal
// Returns false if the passwords are not equal

exports.confirmPasswordsEqual = (pw1, pw2) => {
  const password1 = String(pw1)
  const password2 = String(pw2)
  return password1 === password2
}

exports.formatNames = name => {
  const capitalize = name
    .trim()
    .charAt(0)
    .toUpperCase()
  const restOfName = name.slice(1)
  return capitalize + restOfName
}

exports.formatSocialName = name => {
  const firstName = name.trim().split(' ')[0]
  const capitalize = firstName.charAt(0).toUpperCase()
  const restOfName = firstName.slice(1)
  return capitalize + restOfName
}
