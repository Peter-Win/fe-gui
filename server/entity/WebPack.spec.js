const {expect} = require('chai')
const {parseModule, parseExpression} = require('../parser/parseExpression')
const {ReaderCtx} = require('../parser/ReaderCtx')
const {Style} = require('../parser/Style')
const {formatChunks} = require('../parser/WriterCtx')
const {
  findConfigRoot,
  findAssign,
  findRule,
  findPath,
  isLoaderInRule,
  mergeObjectTaxons,
  merge,
  makeRuleRegexp,
  findConstValueTaxon
} = require('./WebPack.utils')
const {Taxon} = require('../parser/taxons/Taxon')
const {TxObject} = require('../parser/taxons/TxObject')

describe('find config root', () => {
    it('minimal', () => {
        const source = `
const path = require('path');
module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
}`
        const moduleNode = parseModule(ReaderCtx.fromText(source))
        expect(moduleNode.txType === 'TxModule')
        const moduleTaxon = moduleNode.createTaxon()
        expect(moduleTaxon.type).to.equal('TxModule')
        const rootTaxon = findConfigRoot(moduleTaxon)
        expect(rootTaxon.type).to.equal('TxObject')
    })

    it('two steps', () =>{
        const source = `
const path = require('path');
const config = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
}
module.exports = config
`
        const moduleTaxon = parseModule(ReaderCtx.fromText(source)).createTaxon()
        const rootTaxon = findConfigRoot(moduleTaxon)
        expect(rootTaxon.type).to.equal('TxName')
        const {name} = rootTaxon
        const declTaxon = findAssign(moduleTaxon, name)
        expect(declTaxon.type).to.equal('TxObject')
        expect(declTaxon.dict).to.have.property('entry')
        expect(declTaxon.dict.entry.type).to.equal('TxConst')
        expect(declTaxon.dict.entry.constType).to.equal('string')
    })
})

it('part parse', () => {
    const example = `
 {
    module: {
        rules: [
            {
                test: /\\.js$/,
                exclude: /(node_modules|fe-gui)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
}`
    const node = parseExpression(ReaderCtx.fromText(example))
    const root = node.createTaxon()
    expect(root.type).to.equal('TxObject')
    expect(root.dict).to.have.property('module')
    expect(root.items).to.be.lengthOf(1)
    const {module} = root.dict
    expect(module.type).to.equal('TxObject')
    const {rules} = module.dict
    expect(rules.type).to.equal('TxArray')
    expect(rules.subTaxons).to.be.lengthOf(1)
    const rules0 = rules.subTaxons[0]
    expect(rules0.type).to.equal('TxObject')
    expect(rules0.items).to.be.lengthOf(3)
    const {test, use} = rules0.dict
    expect(test.type).to.equal('TxConst')
    expect(test.constType).to.equal('regexp')
    expect(use.type).to.equal('TxObject')
})

/**
 * @param {string} text
 * @return {TxExpression}
 */
const parseExp = (text) => parseExpression(ReaderCtx.fromText(text)).createTaxon()

const codeText = (source) => {
  const chunks = []
  const style = new Style()
  source.exportChunks(chunks, style)
  return formatChunks(chunks, style)
}

describe('mergeObjectTaxons', () => {
    it('simple', () => {
        const sourceText = '{zero: 0}'
        const additionText = '{first: "Hello",second: 3.14}'
        const source = parseExp(sourceText)
        const addition = parseExp(additionText)
        mergeObjectTaxons(source, addition)
        const result = `{\n  zero: 0,\n  first: "Hello",\n  second: 3.14,\n}`
        expect(codeText(source)).to.equal(result)
    })
    it('nested', () => {
        const source = parseExp('{first:{second:{x:1}}}')
        const addition = parseExp('{first:{second:{y:2}}}')
        mergeObjectTaxons(source, addition)
        const result = `{
  first: {
    second: {
      x: 1,
      y: 2,
    },
  },
}`
        expect(codeText(source)).to.equal(result)
    })

    it('duplicated values', () => {
      const source = parseExp(`{first:1, second:2}`)
      const addition = parseExp(`{first:1, third:3}`)
      mergeObjectTaxons(source, addition)
      const result = `{\n  first: 1,\n  second: 2,\n  third: 3,\n}`
      expect(codeText(source)).to.equal(result)
    })

    it('kebab-case key', () => {
      const source = parseExp(`{first: "First"}`)
      const addition = parseExp(`{"react-dom": "@hot-loader"}`)
      mergeObjectTaxons(source, addition)
      const result = `{\n  first: "First",\n  "react-dom": "@hot-loader",\n}`
      expect(codeText(source)).to.equal(result)
    })
})

describe('merge', () => {
    it('babel', () => {
        const srcConfig = `const path = require('path');
const config = {
  entry: './src/index.js',
  output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
  },
};
module.exports = config;`

        const addition = `{
    module: {
        rules: [
            {
                test: /\\.js$/,
                exclude: /(node_modules|fe-gui)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
}`
        const expectedText = `const path = require('path');
const config = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\\.js$/,
        exclude: /(node_modules|fe-gui)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
            ],
          },
        },
      },
    ],
  },
};
module.exports = config;
`
        const result = merge(srcConfig, addition)
        expect(result).to.equal(expectedText)
    })

    it('add rules', () => {
        const src = `module.exports = {module:{rules:[{test: /\\.js$/}]}}`
        const addition = `{module:{rules:[{test: /\\.css$/}]}}`
        const expectedText = `module.exports = {
  module: {
    rules: [
      {
        test: /\\.js$/,
      },
      {
        test: /\\.css$/,
      },
    ],
  },
};
`
        const result = merge(src, addition)
        expect(result).to.equal(expectedText)
    })
})

describe('findRule', () => {
    const source = `
module.exports = {
  entry: './src/index.tsx',
  module: {
    rules: [
      {
        test: /\\.tsx?$/,
        use: 'ts-loader',
      },
      {
        test: /\\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader',
        ],
      },
    ],
  },
}`
    it('.less', () => {
        const sourceNode = parseModule(ReaderCtx.fromText(source))
        const sourceTaxon = sourceNode.createTaxon()

        const rule = findRule(sourceTaxon, '.less')
        expect(rule).to.be.instanceof(Taxon)
        expect(rule.type).to.equal('TxObject')
        const use = findPath(rule, 'use')
        expect(use.type).to.equal('TxArray')
    })

    it('exclude', () => {
      const src = `module.exports = {
  module: {
    rules: [
      { test: /\\.module\\.less$/, name: "module" },
      { test: /\\.less$/, name: "style" },
    ]
  }
}`
      const sourceNode = parseModule(ReaderCtx.fromText(src))
      const sourceTaxon = sourceNode.createTaxon()

      const ruleMiss = findRule(sourceTaxon, '.module.less')
      expect(ruleMiss.dict.name.constValue).to.equal(`"module"`) // because module before then style

      const ruleModule = findRule(sourceTaxon, '.module.less', '.less')
      expect(ruleModule).to.be.instanceof(TxObject)
      expect(ruleModule.dict.name.constValue).to.equal(`"module"`)

      const ruleStyle = findRule(sourceTaxon, '.less')
      expect(ruleStyle.dict.name.constValue).to.equal(`"style"`)

      const ruleCss = findRule(sourceTaxon, '.css')
      expect(ruleCss).to.equal(undefined)
    })

    it('Less after CssModules', () => {
      const src = 
`module.exports = {
  module: {
    rules: [
      {
        test: /\.module\.less$/,
        name: 'modules',
      },
      {
        test: /\.less$/,
        name: 'styles',
      },
    ],
  },
};`
      const sourceNode = parseModule(ReaderCtx.fromText(src))
      const sourceTaxon = sourceNode.createTaxon()
      const ruleLess = findRule(sourceTaxon, '.less')
      expect(ruleLess).to.be.instanceOf(TxObject)
      expect(ruleLess.dict.name.constValue).to.equal(`'styles'`)
    })

  it('webpack config as a function', () => {
    // similar to https://webpack.js.org/configuration/mode/#mode-none
    const src =
`const config = {
  entry: './app.js',
  module: {
    rules: [{ test: /\\.js$/, name: 'js' }],
  },
};
module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.devtool = 'source-map';
  }
  return config;
};`
    const sourceTaxon = parseModule(ReaderCtx.fromText(src)).createTaxon()
    const ruleLess = findRule(sourceTaxon, '.js')
    expect(ruleLess).to.be.instanceOf(TxObject)
    expect(ruleLess.dict.name.constValue).to.equal(`'js'`)
  })
})

describe('makeRuleRegexp', () => {
  it('single case', () => {
    expect(makeRuleRegexp('png').toString()).to.equal('/\\.png$/')
  })
  it('multiple case', () => {
    expect(makeRuleRegexp(['png', 'jpg', 'jpeg']).toString()).to.equal('/\\.(png|jpg|jpeg)$/')
  })
})

describe('findConstValueTaxon', () => {
  it('simple case', async () => {
    const source = `module.exports = { first: 1 }`
    const moduleTaxon = parseModule(ReaderCtx.fromText(source)).createTaxon()
    const rootTaxon = findConfigRoot(moduleTaxon)
    expect(rootTaxon.dict.first.constValue).to.equal('1')
    const txOne = await findConstValueTaxon(rootTaxon.dict.first)
    expect(txOne.type).to.equal('TxConst')
    expect(txOne.constType).to.equal('number')
    expect(txOne.constValue).to.equal('1')
  })
})

describe('isLoaderInRule', () => {
  it('null', () => {
    expect(isLoaderInRule(null, 'babel-loader')).to.equal(false)
    expect(isLoaderInRule(null, 'ts-loader')).to.equal(false)
  })
  it('use is string const', () => {
    const source = `{ test: /\.tsx?$/, use: 'babel-loader' }`
    const node = parseExpression(ReaderCtx.fromText(source))
    const tx = node.createTaxon()
    expect(isLoaderInRule(tx, 'babel-loader')).to.equal(true)
    expect(isLoaderInRule(tx, 'ts-loader')).to.equal(false)
  })
  it('use is array of string', () => {
    const source = `{
      test: /\.less$/,
      use: [
        'style-loader',
        'css-loader',
        'less-loader',
      ],
      exclude: /\.module\.less$/,
    }`
    const node = parseExpression(ReaderCtx.fromText(source))
    const tx = node.createTaxon()
    expect(isLoaderInRule(tx, 'style-loader')).to.equal(true)
    expect(isLoaderInRule(tx, 'css-loader')).to.equal(true)
    expect(isLoaderInRule(tx, 'less-loader')).to.equal(true)
    expect(isLoaderInRule(tx, 'babel-loader')).to.equal(false)
  })
  it('use is mixed array', () => {
    const source = `      {
      test: /\.module\.css$/,
      use: [
        'style-loader',
        { loader: 'css-loader' },
      ],
    }`
    const node = parseExpression(ReaderCtx.fromText(source))
    const tx = node.createTaxon()
    expect(isLoaderInRule(tx, 'style-loader')).to.equal(true)
    expect(isLoaderInRule(tx, 'css-loader')).to.equal(true)
    expect(isLoaderInRule(tx, 'less-loader')).to.equal(false)
    expect(isLoaderInRule(tx, 'babel-loader')).to.equal(false)
  })
})