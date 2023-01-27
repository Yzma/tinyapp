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