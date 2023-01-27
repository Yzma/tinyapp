require("dotenv").config()

const express = require("express")
const cookieSession = require('cookie-session')
const methodOverride = require('method-override')

const debugRoute = require('./routes/debugRoute')
const loginRoute = require('./routes/loginRoute')
const logoutRoute = require('./routes/logoutRoute')
const redirectShortURLRoute = require('./routes/redirectShortURLRoute')
const registerRoute = require('./routes/registerRoute')
const urlsRoute = require('./routes/urlsRoute')

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

app.use(debugRoute)
app.use(loginRoute)
app.use(registerRoute)
app.use(logoutRoute)
app.use(urlsRoute)
app.use(redirectShortURLRoute)

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`)
})
