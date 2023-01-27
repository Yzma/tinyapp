const { assert } = require('chai')

const { isValid } = require('../util/util')

describe('isValid', function() {
  it('should return true for valid parameters of email and password', function() {
    const email = "test@test.com"
    const password = "password"
   
    assert.equal(isValid(email, password), true)
  })

  it('should return false for empty email', function() {
    const email = ""
    const password = "password"
   
    assert.equal(isValid(email, password), false)
  })

  it('should return false for empty password', function() {
    const email = "test@test.com"
    const password = ""
   
    assert.equal(isValid(email, password), false)
  })

  it('should return false for null password', function() {
    const email = "test@test.com"
   
    assert.equal(isValid(email, null), false)
  })
})