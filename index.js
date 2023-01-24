const { getUserByCookie, getUserByEmail, getURLSForUser, isValid, generateUid } = require('./helper')
const express = require("express")
const cookieSession = require('cookie-session')
const cookieParser = require('cookie-parser')
const bcrypt = require("bcryptjs")
const methodOverride = require('method-override')

const app = express()
const PORT = 8080

app.use(cookieSession({
  name: 'session',
  keys: ["SomeSecretKeyThatShouldNotBeInGitHub"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs")
app.use(methodOverride('_method'))

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
}

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
  res.send("Hello!")
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
})

/**
 * Debug Route
 */

app.get("/users", (req, res) => {
  res.send(users)
})

app.get("/urldatabase", (req, res) => {
  res.send(urlDatabase)
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
    res.render("login", templateVars)
    return
  }

  res.redirect('/urls')
})

app.post("/login", (req, res) => {
  const { email, password } = req.body

  if (!isValid(email, password)) {
    res.status(400).send("Error: Invalid email or password params")
    return
  }

  const user = getUserByEmail(email, users)
  if (!user) {
    res.status(400).send("Error: Account with provided email does not exist")
    return
  }

  if (!bcrypt.compareSync(password, user.password)) {
    res.status(400).send("Error: Invalid password")
    return
  }

  req.session.userID = user.id
  res.redirect('/urls')
})

app.post("/logout", (req, res) => {
  req.session = null
  res.redirect('/login')
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
    res.render("register", templateVars)
    return
  }

  res.redirect('/urls')
})

app.post("/register", (req, res) => {
  const { email, password } = req.body

  if (!isValid(email, password)) {
    res.status(400).send("Error: Invalid email or password params")
    return
  }

  const user = getUserByEmail(email, users)
  if (user) {
    res.status(400).send("Error: Account with that email already exists")
    return
  }

  const id = generateUid()
  const hashedPassword = bcrypt.hashSync(password, 10)
  users[id] = {
    id: id,
    email: email,
    password: hashedPassword
  }

  req.session.userID = id
  res.redirect('/urls')
})

/**
 * URL Routes
 */

app.get("/urls", (req, res) => {
  const userByCookie = getUserByCookie(req, users)
  if (!userByCookie) {
    res.redirect('/login')
    return
  }

  const urls = getURLSForUser(userByCookie, urlDatabase)
  const templateVars = {
    urls: urls,
    user: userByCookie
  }
  res.render("urls_index", templateVars)
})

app.post("/urls", (req, res) => {
  const userByCookie = getUserByCookie(req, users)
  if (!userByCookie) {
    res.send("<html><p>You do not have permission to create new URLs</p></html>")
    return
  }

  const longURL = req.body.longURL
  if (!longURL) {
    res.send('Error: invalid URL')
    return
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
    res.redirect('/login')
    return
  }

  const templateVars = {
    user: userByCookie
  }
  res.render("urls_new", templateVars)
})

app.get("/urls/:id", (req, res) => {
  const foundURL = urlDatabase[req.params.id]
  if (!foundURL) {
    res.send("<html><p>That short URL id does not exist</p></html>")
    return
  }
  const templateVars = {
    id: req.params.id,
    url: foundURL,
    user: getUserByCookie(req, users)
  }
  res.render("urls_show", templateVars)
})

app.put("/urls/:id", (req, res) => {
  const id = req.params.id
  const longURL = req.body.longURL

  if (!id) {
    res.send('Error: invalid ID')
    return
  }

  if (!longURL) {
    res.send('Error: invalid URL')
    return
  }

  const userByCookie = getUserByCookie(req, users)
  if (!userByCookie) {
    res.redirect('/login')
    return
  }

  const url = urlDatabase[id]
  if (!url) {
    res.send('Error: URL not found')
    return
  }

  if (userByCookie.id !== url.userID) {
    res.redirect('/login')
    return
  }

  url.longURL = longURL
  res.redirect(`/urls/`)
})

app.delete("/urls/:id/delete", (req, res) => {
  const id = req.params.id

  if (!id) {
    res.send('Error: invalid ID')
    return
  }

  const userByCookie = getUserByCookie(req, users)
  if (!userByCookie) {
    res.redirect('/login')
    return
  }

  const url = urlDatabase[id]
  if (!url) {
    res.send('Error: URL not found')
    return
  }

  if (userByCookie.id !== url.userID) {
    res.redirect('/login')
    return
  }

  delete urlDatabase[req.params.id]
  res.redirect('/urls')
})

app.get("/u/:id", (req, res) => {
  const foundURL = urlDatabase[req.params.id]
  if (!foundURL) {
    res.send("<html><p>That short URL id does not exist</p></html>")
    return
  }

  const trackingCookie = req.cookies['trackerID']
  if (!trackingCookie) {
    const newUid = generateUid()
    res.cookie('trackerID', newUid, { maxAge: 900000, httpOnly: true })
    foundURL.uniqueVisitors.push(newUid)
  } else {
    const hasVisitedBefore = foundURL.uniqueVisitors.includes(trackingCookie)
    if (!hasVisitedBefore) {
      foundURL.uniqueVisitors.push(trackingCookie)
    }
  }

  foundURL.totalTimesVisited++
  res.redirect(foundURL.longURL)
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})
