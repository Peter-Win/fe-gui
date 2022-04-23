const {expect} = require('chai')
const {findVersionInRows} = require('./Yarn')

const yarnLock = `
"@types/mime@^1":
  version "1.3.2"
  resolved "https://registry.yarnpkg.com/@types/mime/-/mime-1.3.2.tgz#93e25bf9ee75fe0fd80b594bc4feb0e862111b5a"

"@types/react@*", "@types/react@^17.0.43":
  version "17.0.43"
  resolved "https://registry.yarnpkg.com/@types/react/-/react-17.0.43.tgz#4adc142887dd4a2601ce730bc56c3436fdb07a55"
  integrity sha512-8Q+LNpdxf057brvPu1lMtC5Vn7J119xrP1aq4qiaefNioQUYANF/CYeK4NsKorSZyUGJ66g0IM+4bbjwx45o2A==
  dependencies:
    "@types/prop-types" "*"
    "@types/scheduler" "*"
    csstype "^3.0.2"

css-loader@^6.7.1:
  version "6.7.1"
  resolved "https://registry.yarnpkg.com/css-loader/-/css-loader-6.7.1.tgz#e98106f154f6e1baf3fc3bc455cb9981c1d5fd2e"
  integrity sha512-yB5CNFa14MbPJcomwNh3wLThtkZgcNyI2bNMRt8iE5Z8Vwl7f8vQXFAzn2HDOJvtDq2NTZBUGMSUNNyrv3/+cw==
`.split('\n')

it('findVersionInRows', () => {
    expect(findVersionInRows(yarnLock, '@types/mime')).to.equal('1.3.2')
    expect(findVersionInRows(yarnLock, '@types/react')).to.equal('17.0.43')
    expect(findVersionInRows(yarnLock, 'css-loader')).to.equal('6.7.1')
    expect(findVersionInRows(yarnLock, 'bad-name')).to.equal(null)
})