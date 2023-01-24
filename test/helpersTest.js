const { assert } = require('chai')

const { getUserByEmail, getURLSForUser, isValid } = require('../helper.js')

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
  id1: {
    id: 'b6UTxQ',
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  id2: {
    id: 'b6UTxQ',
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  id3: {
    id: 'i3BoGr',
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
  },
}

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID"

    assert.equal(user.id, expectedUserID)
  })
})

describe('getURLSForUser', function() {
  it('should return an array of urls that belong to the user', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const urls = getURLSForUser(user, urlDatabase)
    const expectedURLS = [
      {
        id: 'b6UTxQ',
        longURL: "http://www.lighthouselabs.ca",
        userID: "userRandomID",
      },
      {
        id: 'b6UTxQ',
        longURL: "http://www.lighthouselabs.ca",
        userID: "userRandomID",
      },
    ]

    assert.deepEqual(urls, expectedURLS)
  })
})

describe('getURLSForUser', function() {
  it('should return true for valid parameters of email and password', function() {
    const email = "test@test.com"
    const password = "password"
   
    assert.equal(isValid(email, password), true)
  })

  it('should return false for empty email', function() {
    const email = ""
    const password = "password"
   
    assert.equal(isValid(email, password), false)
  })

  it('should return false for empty password', function() {
    const email = "test@test.com"
    const password = ""
   
    assert.equal(isValid(email, password), false)
  })
})