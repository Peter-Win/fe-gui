const {expect} = require('chai')
const { updateTSConfig, makeRelativeTypesName } = require('./AssetModulesTS')
const { makeSrcName } = require('../../fileUtils')

const simpleResult = 
`{
  "compilerOptions": {
    "typeRoots": [
      "node_modules/@types",
      "src/types"
    ]
  }
}`
const stdResult = 
`{
  "compilerOptions": {
    "outDir": "./dist/",
    "typeRoots": [
      "node_modules/@types",
      "src/types"
    ]
  }
}`
const resultWithTypeRoots = 
`{
  "compilerOptions": {
    "outDir": "./dist/",
    "typeRoots": [
      "node_modules/@types",
      "src/types"
    ]
  }
}`

const srcTypes = 'src/types'

describe('updateTSConfig', () => {
    it('without partition', () => {
        expect(updateTSConfig('{}', srcTypes)).to.equal(simpleResult)
    })
    it('without typeRoots', () => {
        expect(updateTSConfig('{"compilerOptions": {}}', srcTypes)).to.equal(simpleResult)
        expect(updateTSConfig('{"compilerOptions": {"outDir": "./dist/"}}', srcTypes)).to.equal(stdResult)
    })
    it('with typeRoots', () => {
        const src = '{"compilerOptions": {"outDir": "./dist/", "typeRoots": ["node_modules/@types"]}}'
        expect(updateTSConfig(src, srcTypes)).to.equal(resultWithTypeRoots)
    })
})

describe('makeRelativeTypesName', () => {
    it('std', () => {
        const fullName = makeSrcName('types')
        expect(makeRelativeTypesName(fullName)).to.equal('src/types')
    })
})