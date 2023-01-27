
const express = require("express")
const router = express.Router()

router.post("/logout", (req, res) => {
  req.session.userID = null
  return res.redirect('/login')
})

module.exports = router