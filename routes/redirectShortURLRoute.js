const { getURLFromID } = require('../util/databaseHelper')
const { generateUid } = require('../util/util')

const express = require("express")
const router = express.Router()

router.get("/u/:id", (req, res) => {
  const foundURL = getURLFromID(req.params.id)
  if (!foundURL) {
    return res.send("<html><p>That short URL id does not exist</p></html>")
  }

  // Generate trackerID when visiting a URL
  if (!req.session.trackerID) {
    req.session.trackerID = generateUid()
  }

  const trackerID = req.session.trackerID
  const hasVisitedBefore = foundURL.uniqueVisitors.find((e) => e.trackerID === trackerID)
  if (!hasVisitedBefore) {
    foundURL.uniqueVisitors.push({
      trackerID: trackerID,
      timestamp: new Date()
    })
  }

  foundURL.totalTimesVisited++

  return res.redirect(foundURL.longURL)
})

module.exports = router
