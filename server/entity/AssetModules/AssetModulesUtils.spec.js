const {expect} = require('chai')
const {isAssetModulesRules, buildAssetRules, mergeRulesIntoConfig, mergeAssetModulesIntoConfig, buildFullExtList} = require('./AssetModulesUtils')
const {parseModule} = require('../../parser/parseExpression')
const {Style} = require('../../parser/Style')
const {ReaderCtx} = require('../../parser/ReaderCtx')
const {formatChunks} = require('../../parser/WriterCtx')

const src = 
`const path = require('path');
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\\.jsx?$/,
        use: 'babel-loader',
      }
    ]
  },
};
`

describe('isAssetModulesRules', () => {
    it('no rules', () => {
        expect(isAssetModulesRules(src)).to.equal(false)
    })
    it('have rules', () => {
        const text = `
module.exports = {
  module: {
    rules: [
        { test: /\\.jsx?$/, use: 'babel-loader' },
        { test: /\\.png$/, type: "asset/resource" }
    ]
  }
}`
        expect(isAssetModulesRules(text)).to.equal(true)
    })
})

describe('buildAssetRules', () => {
    // https://webpack.js.org/guides/asset-modules/#resource-assets
    it('asset/resource for png files', () => {
        const params = {
            rules: [{ extList: 'png', type: 'resource' }],
        }
        expect(buildAssetRules(params)).to.eql([
            { rule: { test: /\.png$/, type: 'asset/resource' } }
        ])
    })

    it('asset/resource for several equal types', () => {
        const params = {
            rules: [
                { extList: 'png, jpg jpeg', type: 'resource' },
            ],
        }
        const rules = buildAssetRules(params)
        const rule0 = rules[0].rule
        rule0.test = rule0.test.toString() // Иначе не работает сравнение двух регэкспов, хотя они одинаковые
        expect(rules).to.eql([
            { rule: { test: '/\\.(png|jpg|jpeg)$/', type: 'asset/resource' } }
        ])
    })

    it('resource and inline mix', () => {
        const params = {
            rules: [
                { extList: 'svg', type: 'inline' },
                { extList: 'jpg jpeg', type: 'resource' },
            ],
        }
        const rules = buildAssetRules(params)
        const rule1 = rules[1].rule
        rule1.test = rule1.test.toString() // Иначе не работает сравнение двух регэкспов, хотя они одинаковые
        expect(rules).to.eql([
            { rule: { test: /\.svg$/, type: 'asset/inline' } },
            { rule: { test: '/\\.(jpg|jpeg)$/', type: 'asset/resource' } },
        ])
    })

    it('custom filename', () => {
        const params = {
            rules: [{ extList: 'gif', type: 'default', filename: 'images/[hash][ext]' }],
        }
        const rules = buildAssetRules(params)
        rules[0].rule.test = rules[0].rule.test.toString()
        expect(rules).to.eql([
            {
                rule: {
                    test: /\.gif$/.toString(),
                    type: 'asset',
                    generator: { filename: 'images/[hash][ext]' },
                }
            }
        ])
    })
})

describe('mergeRulesIntoConfig', () => {
    it('png', () => {
        const dst = 
`const path = require('path');
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\\.jsx?$/,
        use: 'babel-loader',
      },
      {
        test: /\\.png$/,
        type: 'asset/resource',
      },
    ],
  },
};
`
        const wpConfigNode = parseModule(ReaderCtx.fromText(src))
        const wpConfigTaxon = wpConfigNode.createTaxon()
        const rules = buildAssetRules({
            rules: [{ extList: 'png', type: 'resource' }],
        })
        const style = new Style()
        style.singleQuote = true
        mergeRulesIntoConfig(rules, wpConfigTaxon, style)
        const chunks = []
        wpConfigTaxon.exportChunks(chunks, style)
        const text = formatChunks(chunks, style)
        expect(text).to.equal(dst)
    })
})

describe('mergeAssetModulesIntoConfig', () => {
    it('assetModuleFilename', () => {
        const dst =
`const path = require('path');
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    assetModuleFilename: 'images/[hash][ext][query]',
  },
  module: {
    rules: [
      {
        test: /\\.jsx?$/,
        use: 'babel-loader',
      },
    ],
  },
};
`
        const params = { rules: [], assetModuleFilename: 'images/[hash][ext][query]' }
        const wpConfigNode = parseModule(ReaderCtx.fromText(src))
        const wpConfigTaxon = wpConfigNode.createTaxon()
        mergeAssetModulesIntoConfig(params, wpConfigTaxon)
        const chunks = []
        const style = new Style()
        style.singleQuote = true
        wpConfigTaxon.exportChunks(chunks, style)
        const text = formatChunks(chunks, style)
        expect(text).to.equal(dst)
    })
})

describe('buildFullExtList', () => {
    it('different', () => {
        const list = buildFullExtList([
            { extList: 'svg' },
            { extList: 'png, jpg jpeg' },
            { extList: 'png' }, // double
        ])
        expect(list).to.eql(['svg', 'png', 'jpg', 'jpeg'])
    })
})