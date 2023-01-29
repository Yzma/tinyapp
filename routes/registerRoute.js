const { createUser, getUserByCookie, getUserByEmail } = require('../util/databaseHelper')
const { isValid } = require('../util/util')

const express = require("express")
const router = express.Router()

router.get("/register", (req, res) => {
  const userByCookie = getUserByCookie(req)
  if (!userByCookie) {
    const templateVars = {
      user: null
    }
    return res.render("register", templateVars)
  }

  return res.redirect('/urls')
})

router.post("/register", (req, res) => {
  const { email, password } = req.body

  if (!isValid(email, password)) {
    return res.status(400).send("<html><p>Error: Invalid email or password</p></html>")
  }

  const user = getUserByEmail(email)
  if (user) {
    return res.status(400).send("<html><p>Error: Account with that email already exists</p></html>")
  }

  const newUser = createUser(email, password)

  req.session.userID = newUser.id
  return res.redirect('/urls')
})

module.exports = router
