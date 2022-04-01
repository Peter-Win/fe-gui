const {expect} = require('chai')
const {findVersionInJson} = require('./NPM')

const packageLock = `{
  "name": "fe-gui-test",
  "version": "1.0.0",
  "lockfileVersion": 2,
  "requires": true,
  "packages": {
    "node_modules/@types/mime": {
      "version": "1.3.2",
      "resolved": "https://registry.npmjs.org/@types/mime/-/mime-1.3.2.tgz",
      "integrity": "sha512-YATxVxgRqNH6nHEIsvg6k2Boc1JHI9ZbH5iWFFv/MTkchz3b1ieGDa5T0a9RznNdI0KhVbdbWSN+KWWrQZRxTw==",
      "dev": true
    },
    "node_modules/@types/react": {
      "version": "17.0.43",
      "resolved": "https://registry.npmjs.org/@types/react/-/react-17.0.43.tgz",
      "integrity": "sha512-8Q+LNpdxf057brvPu1lMtC5Vn7J119xrP1aq4qiaefNioQUYANF/CYeK4NsKorSZyUGJ66g0IM+4bbjwx45o2A==",
      "devOptional": true,
      "dependencies": {
        "@types/prop-types": "*",
        "@types/scheduler": "*",
        "csstype": "^3.0.2"
      }
    },
    "node_modules/css-loader": {
      "version": "6.7.1",
      "resolved": "https://registry.npmjs.org/css-loader/-/css-loader-6.7.1.tgz",
      "integrity": "sha512-yB5CNFa14MbPJcomwNh3wLThtkZgcNyI2bNMRt8iE5Z8Vwl7f8vQXFAzn2HDOJvtDq2NTZBUGMSUNNyrv3/+cw==",
      "dev": true
    }
  }
}`

describe('findVersionInJson', () => {
    const json = JSON.parse(packageLock)
    expect(findVersionInJson(json, '@types/mime')).to.equal('1.3.2')
    expect(findVersionInJson(json, '@types/react')).to.equal('17.0.43')
    expect(findVersionInJson(json, 'css-loader')).to.equal('6.7.1')
    expect(findVersionInJson(json, 'bad-name')).to.equal(null)
})