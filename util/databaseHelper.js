const { generateUid } = require('./util')
const users = require('../database/userDB')
const urlDatabase = require('../database/urlDB')

const bcrypt = require("bcryptjs")

/**
 * Creates a new User and inserts the Object into the Users database
 *
 * @param {String} email The email provided by the user
 * @param {String} password A plaintext password that will be hashed
 * @returns The newly created User object
 */
const createUser = function(email, password) {

  const id = generateUid()
  const hashedPassword = bcrypt.hashSync(password, 10)
  const user = users[id] = {
    id,
    email,
    password: hashedPassword
  }
  return user
}

/**
 * Creates a new URL and inserts the Object into the URL database
 *
 * @param {*} user The User that will own the new URL
 * @param {*} longURL The long URL that the user will be redirected to when visiting the short link
 * @returns The newly created URL object
 */
const createURL = function(user, longURL) {
  const id = generateUid()
  const newURL = urlDatabase[id] = {
    id,
    longURL,
    userID: user.id,
    totalTimesVisited: 0,
    uniqueVisitors: []
  }
  return newURL
}

/**
 * Returns the associated user by the provided Request object.
 * If the user ID from the Users cookie is valid, search the Users database and return
 * the user with the associated session User ID.
 *
 * @param {Request} req The request object from express to find the session user ID
 * @returns The User object associated with the session User ID. Undefined if the session ID is null
 */
const getUserByCookie = function(req) {
  const userId = req.session.userID
  if (!userId) {
    return undefined
  }

  return users[userId]
}

/**
 * Returns the User object associated with the provided email.
 * Loop through the Users database and check if the provided email matches.
 *
 * @param {String} email The users email to search the Users database
 * @returns The user that matches the provided email. Undefined if not found.
 */
const getUserByEmail = function(email) {
  for (let i in users) {
    if (users[i].email === email)
      return users[i]
  }

  return undefined
}

/**
 * Returns an array of URL objects that belong to a user.
 * Loop through the URL database and check if that URLs user ID matches the provided users ID.
 *
 * @param {Object} user the user that will be used to search for their URLs
 * @returns An array of URL objects that belong to the user. An empty array if the user is undefined.
 */
const getURLSForUser = function(user) {
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

/**
 * Deletes the provided URL from the URL database
 *
 * @param {Object} url The URL to delete
 */
const deleteURL = function(url) {
  delete urlDatabase[url.id]
}

/**
 * Returns the URL object from the URL database with the provided URL ID
 * @param {String} id The URL ID to search against
 * @returns The URL object from the provided ID
 */
const getURLFromID = function(id) {
  return urlDatabase[id]
}

/**
 * Checks if the provided URLs User ID matches the provided Users ID
 *
 * @param {Object} user The user to check against the URL
 * @param {Object} url The URL to check against
 * @returns Returns true if the provided URLs User ID matches the Users ID. False otherwise
 */
const userOwnsURL = function(user, url) {
  return user.id === url.userID
}

module.exports = {
  createUser,
  createURL,
  getUserByCookie,
  getUserByEmail,
  getURLSForUser,
  getURLFromID,
  deleteURL,
  userOwnsURL,
}
