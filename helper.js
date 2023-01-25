
const getUserByCookie = function(req, userDatabase) {
  const userId = req.session.userID
  if (!userId) {
    return undefined
  }

  return userDatabase[userId]
}

const getUserByEmail = function(email, userDatabase) {
  for (let i in userDatabase) {
    if (userDatabase[i].email === email)
      return userDatabase[i]
  }
  return undefined
}

const getURLSForUser = function(user, urlDatabase) {
  if (!user) {
    return []
  }

  let result = []
  for (let i in urlDatabase) {
    if (urlDatabase[i].userID === user.id) {
      result.push(urlDatabase[i])
    }
  }
  return result
}

const userOwnsURL = function(user, url) {
  return user.id === url.userID
}

const isValid = function(...params) {
  for (let i of params) {
    if ((!i || i.length === 0)) {
      return false
    }
  }
  return true
}

const generateUid = function() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16)
}

module.exports = {
  getUserByCookie,
  getUserByEmail,
  getURLSForUser,
  isValid,
  userOwnsURL,
  generateUid
}