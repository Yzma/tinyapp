const { getUserByCookie, getUserByEmail } = require('../util/databaseHelper')
const { isValid } = require('../util/util')
const bcrypt = require("bcryptjs")
const express = require("express")
const router = express.Router()

router.get("/login", (req, res) => {
  const userByCookie = getUserByCookie(req)
  if (!userByCookie) {
    const templateVars = {
      user: null
    }
    return res.render("login", templateVars)
  }

  return res.redirect('/urls')
})

router.post("/login", (req, res) => {
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

module.exports = router