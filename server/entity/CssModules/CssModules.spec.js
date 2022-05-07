const {expect} = require('chai')
const {ReaderCtx} = require('../../parser/ReaderCtx')
const {parseModule} = require('../../parser/parseExpression')
const {findConfigRoot, findPath} = require('../WebPack.utils')
const {Style} = require('../../parser/Style')
const {formatChunks} = require('../../parser/WriterCtx')
const {getAvailableExtensions, testModuleTypes, testRule, injectRule, updateDeclarationRows, selectedExtsList} = require('./CssModules.utils')

const parseText = (text) => {
    const sourceNode = parseModule(ReaderCtx.fromText(text))
    return sourceNode.createTaxon()
}
const getRules = (moduleTaxon) => {
    const rootTaxon = findConfigRoot(moduleTaxon)
    return findPath(rootTaxon, 'module.rules')
}
const stringifyTaxon = (taxon, style) => {
    const chunks = []
    taxon.exportChunks(chunks, style)
    return formatChunks(chunks, style)
}

class WebPackStub {
    constructor(configText) {
        this.configText = configText
    }
    async loadConfigTaxon() {
        return parseText(this.configText)
    }
}

const configEmpty = `module.exports = {
  entry: './src/index.jsx',
  module: {
    rules: [
      {
        test: /\\.jsx?$/,
      },
    ],
  },
};`

const configCss = 
`module.exports = {
  entry: './src/index.jsx',
  module: {
    rules: [
      {
        test: /\\.jsx?$/,
      },
      {
        test: /\\.css$/,
      },
    ],
  },
};`

const configCssModules = 
`module.exports = {
  entry: './src/index.jsx',
  module: {
    rules: [
      {
        test: /\\.jsx?$/,
      },
      {
        test: /\\.css$/,
        exclude: /\\.module\\.css$/,
      },
      {
        test: /\\.module\\.css$/,
      },
    ],
  },
};`

const configCssLessModules = 
`module.exports = {
  entry: './src/index.jsx',
  module: {
    rules: [
      {
        test: /\\.jsx?$/,
      },
      {
        test: /\\.css$/,
        exclude: /\\.module\\.css$/,
      },
      {
        test: /\\.module\\.css$/,
      },
      {
        test: /\\.module\\.less$/,
      },
    ],
  },
};`


describe('getAvailableExtensions', () => {
    it('empty', async () => {
        expect(await getAvailableExtensions(
            new WebPackStub(configEmpty), ['css', 'less']
        )).to.deep.equal(new Set(['css', 'less']))
    })
    it('CSS only', async () => {
        expect(await getAvailableExtensions(
            new WebPackStub(configCss), ['css', 'less']
        )).to.deep.equal(new Set(['css', 'less']))
    })
    it('CSS Module', async () => {
        expect(await getAvailableExtensions(
            new WebPackStub(configCssModules), ['css', 'less']
        )).to.deep.equal(new Set(['less']))
    })
    it('CSS modules and LESS modules', async () => {
        expect(await getAvailableExtensions(
            new WebPackStub(configCssLessModules), ['css', 'less']
        )).to.deep.equal(new Set())
    })
})

describe('testModuleTypes', () => {
    const styleExts = ['css', 'less']
    const moduleExts = ['module.css', 'module.less']
    it('empty', async () => {
        const tx = parseText(configEmpty)
        expect(await testModuleTypes(tx, styleExts)).to.deep.equal({})
        expect(await testModuleTypes(tx, moduleExts)).to.deep.equal({})
    })
    it('CSS only', async () => {
        const tx = await parseText(configCss)
        const rules = getRules(tx).subTaxons
        expect(await testModuleTypes(tx, styleExts)).to.deep.equal({css: rules[1]})
        // config with CSS only don't contain 'exclude' field. So it matches css rule
        expect(await testModuleTypes(tx, moduleExts)).to.deep.equal({'module.css': rules[1]})
    })
    it('CSS modules', async () => {
        const tx = await parseText(configCssModules)
        const rules = getRules(tx).subTaxons
        expect(await testModuleTypes(tx, styleExts)).to.deep.equal({css: rules[1]})
        expect(await testModuleTypes(tx, moduleExts)).to.deep.equal({'module.css': rules[2]})
    })
    it('CSS modules and LESS modules', async () => {
        const tx = await parseText(configCssLessModules)
        const rules = getRules(tx).subTaxons
        expect(await testModuleTypes(tx, styleExts)).to.deep.equal({css: rules[1] })
        expect(await testModuleTypes(tx, moduleExts)).to.deep.equal({
            'module.css': rules[2],
            'module.less': rules[3],
        })
    })
})

describe('testRule', () => {
    const moduleTaxon = parseText(configCssLessModules)
    const rootTaxon = findConfigRoot(moduleTaxon)
    const rulesTaxon = findPath(rootTaxon, 'module.rules')
    expect(rulesTaxon.type).to.equal('TxArray')
    const rulesList = rulesTaxon.subTaxons
    expect(rulesList).to.be.an('array').that.have.lengthOf(4)
    const extensions = ['css', 'less']
    const moduleExts = ['module.css', 'module.less']
    it('jsx', async () => {
        const rule = rulesList[0]
        expect(rule.type).to.equal('TxObject')
        expect(rule.dict.test.constValue).to.equal('/\\.jsx?$/')
        expect(await testRule(rule, extensions)).to.deep.equal({})
        expect(await testRule(rule, moduleExts)).to.deep.equal({})
    })
    it('Use exclude expression', async () => {
        const rule = rulesList[1]
        expect(rule.dict.test.constValue).to.equal('/\\.css$/')
        expect(rule.dict.exclude.constValue).to.equal('/\\.module\\.css$/')
        expect(await testRule(rule, extensions)).to.deep.equal({css: rule})
        expect(await testRule(rule, moduleExts)).to.deep.equal({})
    })
    it('CSS module rule', async () => {
        const rule = rulesList[2]
        expect(rule.dict.test.constValue).to.equal('/\\.module\\.css$/')
        expect(await testRule(rule, extensions)).to.deep.equal({})
        expect(await testRule(rule, moduleExts)).to.deep.equal({'module.css': rule})
    })
    it('CSS module rule', async () => {
        const rule = rulesList[3]
        expect(rule.dict.test.constValue).to.equal('/\\.module\\.less$/')
        expect(await testRule(rule, extensions)).to.deep.equal({})
        expect(await testRule(rule, moduleExts)).to.deep.equal({'module.less': rule})
    })
})

describe('injectRule', () => {
    const style = new Style()
    style.singleQuote = true
    it('with simple rule', async () => {
        const tx = parseText(configCss)
        await injectRule(tx, ['css'], 'css', { test: new RegExp(`\\.module\\.css$`) }, style)
        const dst =
`module.exports = {
  entry: './src/index.jsx',
  module: {
    rules: [
      {
        test: /\\.jsx?$/,
      },
      {
        test: /\\.css$/,
        exclude: /\\.module\\.css$/,
      },
      {
        test: /\\.module\\.css$/,
      },
    ],
  },
};
`
        expect(stringifyTaxon(tx, style)).to.be.equal(dst)
    })
    it('with empty config', async () => {
        const tx = parseText(`module.exports = { entry: './src/index.jsx' }`)
        await injectRule(tx, ['css'], 'css', {test: /\.module\.css$/}, style)
        const dst = 
`module.exports = {
  entry: './src/index.jsx',
  module: {
    rules: [
      {
        test: /\\.module\\.css$/,
      },
    ],
  },
};
`
        expect(stringifyTaxon(tx, style)).to.equal(dst)
    })
})

describe('updateDeclarationRows', () => {
  it('empty', () => {
    const rows = []
    const res = updateDeclarationRows(rows, ['css', 'less'])
    expect(res).to.equal(true)
    expect(rows.join('\n')).to.equal(`declare module "*.module.css";\ndeclare module "*.module.less";`)
  })
  it('partial', () => {
    const rows = [`declare module "*.module.less";`]
    const res = updateDeclarationRows(rows, ['css', 'less'])
    expect(res).to.equal(true)
    expect(rows.join('\n')).to.equal(`declare module "*.module.less";\ndeclare module "*.module.css";`)
  })
  it('empty', () => {
    const rows = `declare module "*.module.css";\ndeclare module "*.module.less";`.split('\n')
    const res = updateDeclarationRows(rows, ['css', 'less'])
    expect(res).to.equal(false)
    expect(rows.join('\n')).to.equal(`declare module "*.module.css";\ndeclare module "*.module.less";`)
  })
})

describe('selectedExtsList', () => {
  const styleDef = [
    { agent: 'CSS', exts: ['css'] },
    { agent: 'LESS', exts: ['less'] },
    { agent: 'Sass', exts: ['sass', 'scss'] },
  ]
  it('all', () => {
    expect(selectedExtsList(styleDef, {CSS: true, LESS: true, Sass: true}))
      .to.deep.equal(['css', 'less', 'sass', 'scss'])
  })
  it('empty', () => {
    expect(selectedExtsList(styleDef, {CSS: false, LESS: false, Sass: false})).to.deep.equal([])
  })
  it('single', () => {
    expect(selectedExtsList(styleDef, {Sass: true})).to.deep.equal(['sass', 'scss'])
  })
})
