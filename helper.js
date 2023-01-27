
/**
 * Returns the associated user by the provided Request object.
 * If the user ID from the Users cookie is valid, search the Users database and return
 * the user with the associated session User ID.
 *
 * @param {Request} req The request object from express to find the session user ID
 * @param {Object} userDatabase The Users database to search
 * @returns The User object associated with the session User ID. Undefined if the session ID is null
 */
const getUserByCookie = function(req, userDatabase) {
  const userId = req.session.userID
  if (!userId) {
    return undefined
  }

  return userDatabase[userId]
}

/**
 * Returns the User object associated with the provided email.
 * Loop through the provided Users database and check if the provided email matches.
 *
 * @param {String} email The users email to search the Users database
 * @param {Object} userDatabase The Users database to search
 * @returns The user that matches the provided email. Undefined if not found.
 */
const getUserByEmail = function(email, userDatabase) {
  for (let i in userDatabase) {
    if (userDatabase[i].email === email)
      return userDatabase[i]
  }
  return undefined
}

/**
 * Returns an array of URL objects that belong to a user.
 * Loop through the provided URL database and check if that URLs user ID matches the provided users ID.
 *
 * @param {Object} user the user that will be used to search for their URLs
 * @param {Object} urlDatabase the URL database to search
 * @returns An array of URL objects that belong to the user. An empty array if the user is undefined.
 */
const getURLSForUser = function(user, urlDatabase) {
  if (!user) {
    return []
  }

  let result = []
  for (let i in urlDatabase) {
    if (urlDatabase[i].userID === user.id) {
      result.push(urlDatabase[i])
    }
  }
  return result
}

const userOwnsURL = function(user, url) {
  return user.id === url.userID
}

/**
 * Used to check if the passed in parameters are not null and not empty.
 * This method should be used to validate Strings and Arrays
 *
 * @param  {...any} params The parameters/variables to check their not null and not empty
 * @returns true if all parameters passed in are not null and not empty. False otherwise
 */
const isValid = function(...params) {
  for (let i of params) {
    if ((!i || i.length === 0)) {
      return false
    }
  }
  return true
}

/**
 * Returns a unique string that is used to generate IDs
 * @returns A unique string
 */
const generateUid = function() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16)
}

module.exports = {
  getUserByCookie,
  getUserByEmail,
  getURLSForUser,
  isValid,
  userOwnsURL,
  generateUid
}