const express = require("express")
const app = express()
const PORT = 8080 // default port 8080

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

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase }
  res.render("urls_index", templateVars)
})

app.post("/urls", (req, res) => {
  console.log(req.body)
  res.send("Ok")
})

app.get("/urls/new", (req, res) => {
  const newId = generateUid()
  console.log(req.body + " " + newId)
  console.log(req.body + " " + newId)
  res.render("urls_new")
})

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] }
  res.render("urls_show", templateVars)
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})