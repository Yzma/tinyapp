
/**
 * The URL Object that will store all URLs.
 * Note that due to the simplicity of the app, we just export an empty Object for now, but later on
 * if we use a Database (such as SQL) it would be required to move the URLs Object into a separate file.
 */
const urlDatabase = {
  b6UTxQ: {
    id: 'b6UTxQ',
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
    totalTimesVisited: 0,
    uniqueVisitors: []
  },
  i3BoGr: {
    id: 'i3BoGr',
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
    totalTimesVisited: 0,
    uniqueVisitors: []
  },
}

module.exports = urlDatabase
