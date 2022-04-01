const {expect} = require('chai')

const compareText = (actual, need) => {
    const actualList = Array.isArray(actual) ? actual : actual.split('\n')
    const needList = Array.isArray(need) ? need : need.split('\n')
    for (const i in actualList) {
        expect(actualList[i]).to.equal(needList[i], `Line #${+i+1}`)
    }
}
module.exports = {compareText}