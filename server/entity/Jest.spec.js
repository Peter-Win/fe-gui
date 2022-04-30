const {expect} = require('chai')
const {Style} = require('../parser/Style')
const {parseModule} = require('../parser/parseExpression')
const {ReaderCtx} = require('../parser/ReaderCtx')
const {formatChunks} = require('../parser/WriterCtx')
const {setJestTransform, addPreset} = require('./Jest.utils')
const {compareText} = require('../sysUtils/compareText')

const style = new Style()
style.singleQuote = false

const parseCode = (text) => {
    const sourceNode = parseModule(ReaderCtx.fromText(text))
    return sourceNode.createTaxon()
}

const makeCode = (taxon) => {
    const chunks = []
    taxon.exportChunks(chunks, style)
    return formatChunks(chunks, style)
}

describe('setJestTransform', () => {
    it('without transform part', () => {
        const src = `module.exports = {}`
        const dst =
`module.exports = {
  transform: {
    "\\\\.[jt]sx?$": "babel-jest",
    ".+\\\\.(css|styl|less|sass|scss)$": "jest-css-modules-transform",
  },
};
`
        const moduleTaxon = parseCode(src)
        setJestTransform({
          moduleTaxon,
          transpiler: 'Babel',
          key: ".+\\.(css|styl|less|sass|scss)$",
          value: "jest-css-modules-transform",
          style
        })
        expect(makeCode(moduleTaxon)).to.equal(dst)
    })
    it('TypeScript transpiler', () => {
        const dst =
`module.exports = {
  transform: {
    ".+\\\\.(css|styl|less|sass|scss)$": "jest-css-modules-transform",
  },
};
`
      const moduleTaxon = parseCode(`module.exports = {}`)
      setJestTransform({
        moduleTaxon,
        transpiler: 'TypeScript',
        key: ".+\\.(css|styl|less|sass|scss)$",
        value: "jest-css-modules-transform",
        style
      })
      expect(makeCode(moduleTaxon)).to.equal(dst)
  })
})

describe('addPreset', () => {
  it('create preset', () => {
    const moduleTaxon = parseCode(`module.exports = {}`)
    addPreset({moduleTaxon, preset: 'react', style})
    const dst = `module.exports = {\n  preset: "react",\n};\n`
    compareText(makeCode(moduleTaxon), dst)
  })
  it('add preset to array', () => {
    const moduleTaxon = parseCode(`module.exports = { preset: ["first"] }`)
    addPreset({moduleTaxon, preset: 'second', style})
    const dst =
`module.exports = {
  preset: [
    "first",
    "second",
  ],
};
`
    compareText(makeCode(moduleTaxon), dst)
  })
  it('transform const to array', () => {
    const moduleTaxon = parseCode(`module.exports = { preset: "first" }`)
    addPreset({moduleTaxon, preset: 'second', style})
    const dst =
`module.exports = {
  preset: [
    "first",
    "second",
  ],
};
`
    compareText(makeCode(moduleTaxon), dst)
  })
})