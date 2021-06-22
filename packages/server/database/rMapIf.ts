// mapIf is a repeatable pattern for updating 1 or more values inside an arbitrarily deep nested array on a RethinkDB document
// rArr is the array
// test should return true if you want to update that specific value inside the array
// f is the updater

const rMapIf = (r) => (rArr, test, f) => {
  return rArr.map((x) => r.branch(test(x), f(x), x))
}

export default rMapIf
