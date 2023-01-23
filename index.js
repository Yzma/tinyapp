const express = require("express")
const cookieParser = require('cookie-parser')

const app = express()
const PORT = 8080 // default port 8080

app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

const generateUid = function() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16)
}

app.get("/", (req, res) => {
  res.send("Hello!")
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
})

app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies["username"] ? req.cookies["username"].username : null
  }
  res.render("register", templateVars)
})

app.post("/register", (req, res) => {
  res.redirect('/urls')
})

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"] ? req.cookies["username"].username : null
  }
  res.render("urls_index", templateVars)
})

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL
  if (!longURL) {
    res.send('Error: invalid URL')
    return
  }

  const id = generateUid()
  urlDatabase[id] = longURL

  console.log(req.body)
  res.redirect(`/urls/${id}`)
})

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"] ? req.cookies["username"].username : null
  }
  res.render("urls_new", templateVars)
})

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"] ? req.cookies["username"].username : null
  }
  res.render("urls_show", templateVars)
})

app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL
  if (!longURL) {
    res.send('Error: invalid URL')
    return
  }

  const id = req.params.id

  urlDatabase[id] = longURL
  res.redirect(`/urls/`)
})

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect('/urls/')
})

// TODO: Validate if a URL was actually found
app.get("/u/:id", (req, res) => {
  const foundURL = urlDatabase[req.params.id]
  res.redirect(foundURL)
})

app.post("/login", (req, res) => {
  const username = req.body
  res.cookie('username', username)
  res.redirect('/urls')
})

app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect('/urls')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})