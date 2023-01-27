require("dotenv").config()

const { getUserByCookie, getUserByEmail, getURLSForUser, isValid, userOwnsURL, generateUid } = require('./helper')
const express = require("express")
const cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs")
const methodOverride = require('method-override')

const app = express()
const PORT = 8080

app.use(cookieSession({
  name: 'session',
  keys: [process.env.COOKIE_SECRET],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.set("view engine", "ejs")

const users = {}

const urlDatabase = {
  b6UTxQ: {
    id: 'b6UTxQ',
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
    totalTimesVisited: 0,
    uniqueVisitors: []
  },
  i3BoGr: {
    id: 'i3BoGr',
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
    totalTimesVisited: 0,
    uniqueVisitors: []
  },
}

app.get("/", (req, res) => {
  return res.redirect('/urls')
})

/**
 * Debug Route
 */

app.get("/users", (req, res) => {
  return res.send(users)
})

app.get("/urldatabase", (req, res) => {
  return res.send(urlDatabase)
})

/**
 * Login Route
 */

app.get("/login", (req, res) => {
  const userByCookie = getUserByCookie(req, users)
  if (!userByCookie) {
    const templateVars = {
      user: null
    }
    return res.render("login", templateVars)
  }

  return res.redirect('/urls')
})

app.post("/login", (req, res) => {
  const { email, password } = req.body

  if (!isValid(email, password)) {
    return res.status(400).send("Error: Invalid email or password")
  }

  const user = getUserByEmail(email, users)
  if (!user) {
    return res.status(400).send("Error: Account with provided email does not exist")
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(400).send("Error: Invalid password")
  }

  req.session.userID = user.id
  return res.redirect('/urls')
})

app.post("/logout", (req, res) => {
  req.session.userID = null
  return res.redirect('/login')
})

/**
 * Register Route
 */

app.get("/register", (req, res) => {
  const userByCookie = getUserByCookie(req, users)
  if (!userByCookie) {
    const templateVars = {
      user: null
    }
    return res.render("register", templateVars)
  }

  return res.redirect('/urls')
})

app.post("/register", (req, res) => {
  const { email, password } = req.body

  if (!isValid(email, password)) {
    return res.status(400).send("Error: Invalid email or password")
  }

  const user = getUserByEmail(email, users)
  if (user) {
    return res.status(400).send("Error: Account with that email already exists")
  }

  const id = generateUid()
  const hashedPassword = bcrypt.hashSync(password, 10)
  users[id] = {
    id: id,
    email: email,
    password: hashedPassword
  }

  req.session.userID = id
  return res.redirect('/urls')
})

/**
 * URL Routes
 */

app.get("/urls", (req, res) => {
  const userByCookie = getUserByCookie(req, users)
  if (!userByCookie) {
    return res.redirect('/login')
  }

  const urls = getURLSForUser(userByCookie, urlDatabase)
  const templateVars = {
    user: userByCookie,
    urls: urls
  }
  return res.render("urls_index", templateVars)
})

app.post("/urls", (req, res) => {
  const userByCookie = getUserByCookie(req, users)
  if (!userByCookie) {
    return res.send("<html><p>You do not have permission to create new URLs</p></html>")
  }

  const longURL = req.body.longURL
  if (!isValid(longURL)) {
    return res.send('Error: invalid URL')
  }

  const id = generateUid()
  urlDatabase[id] = {
    id: id,
    longURL: longURL,
    userID: userByCookie.id,
    totalTimesVisited: 0,
    uniqueVisitors: []
  }

  res.redirect(`/urls/${id}`)
})

app.get("/urls/new", (req, res) => {
  const userByCookie = getUserByCookie(req, users)
  if (!userByCookie) {
    return res.redirect('/login')
  }

  const templateVars = {
    user: userByCookie
  }
  return res.render("urls_new", templateVars)
})

app.get("/urls/:id", (req, res) => {
  const foundURL = urlDatabase[req.params.id]
  if (!foundURL) {
    return res.send("<html><p>That short URL id does not exist</p></html>")
  }

  const user = getUserByCookie(req, users)
  if (!user) {
    return res.send("<html><p>You do not have permission to view this URL</p></html>")
  }

  if (!userOwnsURL(user, foundURL)) {
    return res.send("<html><p>You do not have permission to view this URL</p></html>")
  }

  const templateVars = {
    id: req.params.id,
    url: foundURL,
    user: user
  }
  return res.render("urls_show", templateVars)
})

app.put("/urls/:id", (req, res) => {
  const id = req.params.id
  const longURL = req.body.longURL

  if (!isValid(longURL)) {
    return res.send('Error: invalid URL')
  }

  const userByCookie = getUserByCookie(req, users)
  if (!userByCookie) {
    return res.redirect('/login')
  }

  const url = urlDatabase[id]
  if (!url) {
    return res.send('Error: URL not found')
  }

  if (!userOwnsURL(userByCookie, url)) {
    return res.redirect('/login')
  }

  url.longURL = longURL
  return res.redirect(`/urls`)
})

app.delete("/urls/:id/delete", (req, res) => {
  const id = req.params.id

  const userByCookie = getUserByCookie(req, users)
  if (!userByCookie) {
    return res.redirect('/login')
  }

  const url = urlDatabase[id]
  if (!url) {
    return res.send('Error: URL not found')
  }

  if (!userOwnsURL(userByCookie, url)) {
    return res.redirect('/login')
  }

  delete urlDatabase[req.params.id]
  return res.redirect('/urls')
})

app.get("/u/:id", (req, res) => {
  const foundURL = urlDatabase[req.params.id]
  if (!foundURL) {
    return res.send("<html><p>That short URL id does not exist</p></html>")
  }

  // Generate trackerID when visiting a URL
  if (!req.session.trackerID) {
    req.session.trackerID = generateUid()
  }

  const trackerID = req.session.trackerID
  const hasVisitedBefore = foundURL.uniqueVisitors.find((e) => e.trackerID === trackerID)
  if (!hasVisitedBefore) {
    foundURL.uniqueVisitors.push({
      trackerID: trackerID,
      timestamp: new Date()
    })
  }

  foundURL.totalTimesVisited++

  return res.redirect(foundURL.longURL)
})

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`)
})
