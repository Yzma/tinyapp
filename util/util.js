/**
 * Used to check if the passed in parameters are not null and not empty.
 * This method should be used to validate Strings and Arrays
 *
 * @param  {...any} params The parameters/variables to check their not null and not empty
 * @returns true if all parameters passed in are not null and not empty. False otherwise
 */
const isValid = function(...params) {
  for (let i of params) {
    if ((!i || i.length === 0)) {
      return false
    }
  }
  return true
}

/**
 * Returns a unique string that is used to generate IDs
 * @returns A unique string
 */
const generateUid = function() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16)
}

module.exports = {
  isValid,
  generateUid
}