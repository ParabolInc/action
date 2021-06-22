const assert = () => ({
  invariant: (conditional, error) => {
    if (!conditional) {
      throw new Error(error)
    }
  }
})

module.exports = assert
module.export = {assert}
