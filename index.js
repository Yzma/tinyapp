require("dotenv").config()

const { createUser, createURL, getUserByCookie, getUserByEmail, getURLSForUser, getURLFromID, deleteURL, userOwnsURL, } = require('./util/databaseHelper')
const { isValid, generateUid } = require('./util/util')

const express = require("express")
const cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs")
const methodOverride = require('method-override')

const app = express()
const PORT = process.env.PORT

app.use(cookieSession({
  name: 'session',
  keys: [process.env.COOKIE_SECRET],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.set("view engine", "ejs")


app.get("/", (req, res) => {
  return res.redirect('/urls')
})

/**
 * Debug Route
 */

// app.get("/users", (req, res) => {
//   return res.send(users)
// })

// app.get("/urldatabase", (req, res) => {
//   return res.send(urlDatabase)
// })

/**
 * Login Route
 */

app.get("/login", (req, res) => {
  const userByCookie = getUserByCookie(req)
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
    return res.status(400).send("<html><p>Error: Invalid email or password</p></html")
  }

  const user = getUserByEmail(email)
  if (!user) {
    return res.status(400).send("<html><p>Error: Account with provided email does not exist</p></html")
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(400).send("<html><p>Error: Invalid password</p></html")
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
  const userByCookie = getUserByCookie(req)
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
    return res.status(400).send("<html><p>Error: Invalid email or password</p></html")
  }

  const user = getUserByEmail(email)
  if (user) {
    return res.status(400).send("<html><p>Error: Account with that email already exists</p></html")
  }

  const newUser = createUser(email, password)

  req.session.userID = newUser.id
  return res.redirect('/urls')
})

/**
 * URL Routes
 */

app.get("/urls", (req, res) => {
  const userByCookie = getUserByCookie(req)
  if (!userByCookie) {
    return res.redirect('/login')
  }

  const urls = getURLSForUser(userByCookie)
  const templateVars = {
    user: userByCookie,
    urls: urls
  }
  return res.render("urls_index", templateVars)
})

app.post("/urls", (req, res) => {
  const userByCookie = getUserByCookie(req)
  if (!userByCookie) {
    return res.send("<html><p>You do not have permission to create new URLs</p></html>")
  }

  const longURL = req.body.longURL
  if (!isValid(longURL)) {
    return res.send('<html><p>Error: invalid URL</p></html')
  }

  const newURL = createURL(userByCookie, longURL)

  res.redirect(`/urls/${newURL.id}`)
})

app.get("/urls/new", (req, res) => {
  const userByCookie = getUserByCookie(req)
  if (!userByCookie) {
    return res.redirect('/login')
  }

  const templateVars = {
    user: userByCookie
  }
  return res.render("urls_new", templateVars)
})

app.get("/urls/:id", (req, res) => {
  const foundURL = getURLFromID(req.params.id)
  if (!foundURL) {
    return res.send("<html><p>That short URL id does not exist</p></html>")
  }

  const user = getUserByCookie(req)
  if (!user || !userOwnsURL(user, foundURL)) {
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
    return res.send('<html><p>Error: invalid URL</p></html')
  }

  const userByCookie = getUserByCookie(req)
  if (!userByCookie) {
    return res.redirect('/login')
  }

  const url = getURLFromID(id)
  if (!url) {
    return res.send('<html><p>Error: URL not found</p></html')
  }

  if (!userOwnsURL(userByCookie, url)) {
    return res.redirect('/login')
  }

  // TODO: Check if this works
  url.longURL = longURL
  return res.redirect(`/urls`)
})

app.delete("/urls/:id/delete", (req, res) => {
  const id = req.params.id

  const url = getURLFromID(id)
  if (!url) {
    return res.send('<html><p>Error: URL not found</p></html>')
  }

  const userByCookie = getUserByCookie(req)
  if (!userByCookie || !userOwnsURL(userByCookie, url)) {
    return res.send('<html><p>You must be the owner of this URL to delete it</p></html>')
  }

  // TODO Check if this works
  deleteURL(url)
  return res.redirect('/urls')
})

app.get("/u/:id", (req, res) => {
  const foundURL = getURLFromID(req.params.id)
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
