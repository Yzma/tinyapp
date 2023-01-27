
/**
 * For debug purposes only. This route would not be in production, but is used to check that both the Users and URL databases are being updated correctly.
 */
const users = require('../database/userDB')
const urlDatabase = require('../database/urlDB')

const express = require("express")
const router = express.Router()

router.get("/users", (req, res) => {
  return res.send(users)
})

router.get("/urldatabase", (req, res) => {
  return res.send(urlDatabase)
})

module.exports = router