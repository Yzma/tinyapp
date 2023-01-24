
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

const isValid = function(email, password) {
  if ((!email || email.length === 0) || (!password || password.length === 0)) {
    return false
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
  generateUid
}