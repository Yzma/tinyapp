const { createURL, getUserByCookie, getURLFromID, getURLSForUser, deleteURL, userOwnsURL } = require('../util/databaseHelper')
const { isValid } = require('../util/util')

const express = require("express")
const router = express.Router()

router.get("/urls", (req, res) => {
  const userByCookie = getUserByCookie(req)
  if (!userByCookie) {
    return res.status(401).send("<html><p>You do not have permission to view URLs</p></html>")
  }

  const urls = getURLSForUser(userByCookie)
  const templateVars = {
    user: userByCookie,
    urls: urls
  }
  return res.render("urls_index", templateVars)
})

router.post("/urls", (req, res) => {
  const userByCookie = getUserByCookie(req)
  if (!userByCookie) {
    return res.send("<html><p>You do not have permission to create new URLs</p></html>")
  }

  const longURL = req.body.longURL
  if (!isValid(longURL)) {
    return res.send('<html><p>Error: invalid URL</p></html>')
  }

  const newURL = createURL(userByCookie, longURL)

  res.redirect(`/urls/${newURL.id}`)
})

router.get("/urls/new", (req, res) => {
  const userByCookie = getUserByCookie(req)
  if (!userByCookie) {
    return res.redirect('/login')
  }

  const templateVars = {
    user: userByCookie
  }
  return res.render("urls_new", templateVars)
})

router.get("/urls/:id", (req, res) => {
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

router.put("/urls/:id", (req, res) => {
  const id = req.params.id
  const longURL = req.body.longURL

  if (!isValid(longURL)) {
    return res.send('<html><p>Error: invalid URL</p></html>')
  }

  const url = getURLFromID(id)
  if (!url) {
    return res.send('<html><p>Error: URL not found</p></html>')
  }

  const userByCookie = getUserByCookie(req)
  if (!userByCookie || !userOwnsURL(userByCookie, url)) {
    return res.send('<html><p>You must be the owner of this URL to delete it</p></html>')
  }

  url.longURL = longURL
  return res.redirect(`/urls`)
})

router.delete("/urls/:id/delete", (req, res) => {
  const id = req.params.id

  const url = getURLFromID(id)
  if (!url) {
    return res.send('<html><p>Error: URL not found</p></html>')
  }

  const userByCookie = getUserByCookie(req)
  if (!userByCookie || !userOwnsURL(userByCookie, url)) {
    return res.send('<html><p>You must be the owner of this URL to delete it</p></html>')
  }

  deleteURL(url)
  return res.redirect('/urls')
})

module.exports = router
