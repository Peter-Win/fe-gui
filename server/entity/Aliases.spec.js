const {expect} = require('chai')
const {parseModule} = require('../parser/parseExpression')
const {ReaderCtx} = require('../parser/ReaderCtx')
const {Style} = require('../parser/Style')
const {formatChunks} = require('../parser/WriterCtx')
const {
    loadAliasesList,
    separateAliasesList,
    updateWebPackConfig,
    updateESLintConfig,
    updateTSConfig,
} = require('./Aliases.utils')

const parseConfig = (text) => {
    const sourceNode = parseModule(ReaderCtx.fromText(text))
    return sourceNode.createTaxon()
}
const makeText = (taxon) => {
    const style = new Style()
    const chunks = []
    taxon.exportChunks(chunks, style)
    return formatChunks(chunks, style).trim()
}

describe('loadAliasesList', () => {
    it('without resolve', () => {
        const text = `module.exports = { entry: './src/index.tsx' }`
        const list = loadAliasesList(parseConfig(text))
        expect(list).to.deep.equal([])
    })
    it('without alias', () => {
        const text = `module.exports = {
            resolve: { extensions: [".js", ".jsx"] }
        }`
        const list = loadAliasesList(parseConfig(text))
        expect(list).to.deep.equal([])
    })
    it('empty alias', () => {
        const text = `module.exports = {
            resolve: {
                extensions: [".js", ".jsx"],
                alias: {},
            }
        }`
        const list = loadAliasesList(parseConfig(text))
        expect(list).to.deep.equal([])
    })
    it('simple alias list', () => {
        const text = `module.exports = {
            resolve: {
                extensions: [".js", ".jsx"],
                alias: {
                    'react-dom': '@hot-loader/react-dom',
                    Utilities: path.resolve(__dirname, 'src/utilities'),
                    "my-app": path.resolve(__dirname, 'src/my-app'),
                },
            }
        }`
        const list = loadAliasesList(parseConfig(text))
        expect(list).to.deep.equal([
            ['react-dom'],
            ["Utilities", "src/utilities"],
            ["my-app", "src/my-app"],
        ])
    })
})

describe('separateAliasesList', () => {
    it('main', () => {
        expect(separateAliasesList([])).to.deep.equal({ reserved: {}, pairs: [] })
        expect(separateAliasesList([['one']])).to.deep.equal({ reserved: {one: 1}, pairs: [] })
        expect(separateAliasesList([['a', 'b']])).to.deep.equal({ reserved: {}, pairs: [['a', 'b']] })
        expect(separateAliasesList([['first', '1'], ['hello']])).to.deep.equal({
            reserved: {hello: 1}, pairs: [['first', '1']] 
        })    
    })
})

const configWithSrc =
`module.exports = {
  entry: './src/index.tsx',
  resolve: {
    alias: {
      src: path.join(__dirname, 'src'),
    },
  },
};`
const configWithKebab =
`module.exports = {
  entry: './src/index.tsx',
  resolve: {
    alias: {
      src: path.join(__dirname, 'src'),
      'my-app': path.join(__dirname, 'src/my-app'),
    },
  },
};`
const configWithRouter =
`module.exports = {
  entry: './src/index.tsx',
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
};`
const configWithRouterAndSrc =
`module.exports = {
  entry: './src/index.tsx',
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
      src: path.join(__dirname, 'src'),
    },
  },
};`
const configWithRouterSrcAndComponents =
`module.exports = {
  entry: './src/index.tsx',
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
      src: path.join(__dirname, 'src'),
      components: path.join(__dirname, 'src/components'),
    },
  },
};`
  

describe('updateWebPackConfig', () => {
    const style = new Style()
    style.singleQuote = true
    it('without resolve', () => {
        const src = `module.exports = { entry: './src/index.tsx' }`
        const tx = parseConfig(src)
        updateWebPackConfig(tx, [{ oldKey: '', key: 'src', value: 'src' }], style)
        expect(makeText(tx)).to.equal(configWithSrc)
    })
    it('without alias', () => {
        const src = `module.exports = { entry: './src/index.tsx', resolve: {} }`
        const tx = parseConfig(src)
        updateWebPackConfig(tx, [{ oldKey: '', key: 'src', value: 'src' }], style)
        expect(makeText(tx)).to.equal(configWithSrc)
    })
    it('change src', () => {
        const src = `module.exports = {
            entry: './src/index.tsx',
            resolve: {
                alias: {
                    src: '',
                }
            },
        }`
        const tx = parseConfig(src)
        updateWebPackConfig(tx, [{ oldKey: 'src', key: 'src', value: 'src' }], style)
        expect(makeText(tx)).to.equal(configWithSrc)
    })
    it('kebab with single quotes', () => {
        const tx = parseConfig(configWithSrc)
        updateWebPackConfig(tx, [
            { oldKey: 'src', key: 'src', value: 'src'}, // если не указать, то эта строка будет удалена
            { oldKey: '', key: 'my-app', value: 'src/my-app' }
        ], style)
        expect(makeText(tx)).to.equal(configWithKebab)
    })
    it('delete', () => {
        const tx = parseConfig(configWithKebab)
        updateWebPackConfig(tx, [{ oldKey: 'src', key: 'src', value: 'src' }], style)
        expect(makeText(tx)).to.equal(configWithSrc)
    })
    it('with reserved word', () => {
        const tx = parseConfig(configWithRouter)
        updateWebPackConfig(tx, [{oldKey:'', key: 'src', value: 'src'}], style)
        expect(makeText(tx)).to.equal(configWithRouterAndSrc)
    })
    it('with reserved word and pair', () => {
        const tx = parseConfig(configWithRouterAndSrc)
        updateWebPackConfig(tx, [
            {oldKey: 'src', key: 'src', value: 'src'},
            {oldKey: '', key: 'components', value: 'src/components'},
        ], style)
        expect(makeText(tx)).to.equal(configWithRouterSrcAndComponents)
    })
    // Замена значения...
    it('change value with same key', () => {
        const tx = parseConfig(configWithRouterAndSrc)
        const dst =
`module.exports = {
  entry: './src/index.tsx',
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
      new_src: path.join(__dirname, 'src/new'),
    },
  },
};`
        updateWebPackConfig(tx, [
            {oldKey: 'src', key: 'new_src', value: 'src/new'}
        ], style)
        expect(makeText(tx)).to.equal(dst)
    })
})

describe('updateESLintConfig', () => {
    it('simple', () => {
        const cfg = updateESLintConfig({
            parser: "@babel/eslint-parser"
        }, [['src', 'src'], ['test', 'src/test']], ['.ts', '.tsx'])
        expect(cfg).to.deep.equal({
            parser: "@babel/eslint-parser",
            settings: {
                "import/resolver": {
                    alias: {
                        map: [
                            ['src', './src'],
                            ['test', './src/test'],
                        ],
                        extensions: ['.ts', '.tsx']
                    }
                }
            }
        })
    })
    it('full', () => {
        const src = {
            parser: "@babel/eslint-parser",
            settings: {
                react: {
                  version: "detect"
                },
                "import/resolver": {
                  alias: {
                    "map": [ ["components", "./src/components"] ],
                    "extensions": [".js"]
                  }
                },
            },
        }
        const dst = updateESLintConfig(src, [['src', 'src'], ['test', 'src/test']], ['.ts', '.tsx'])
        expect(dst).to.deep.equal({
            parser: "@babel/eslint-parser",
            settings: {
                react: { version: "detect" },
                "import/resolver": {
                    alias: {
                        map: [
                            ['src', './src'],
                            ['test', './src/test']
                        ],
                        extensions: ['.js', '.ts', '.tsx'],
                    }
                },
            }
        })
    })
})

describe('updateTSConfig', () => {
    it('std', () => {
        const cfg = {
            compilerOptions: {
                paths: {
                    "test/*": ["./test/*"]
                }
            }
        }
        updateTSConfig(cfg, [
            ['src', 'src'],
            ['components', 'src/components'],
            ['test', 'test1']
        ])
        expect(cfg).to.deep.equal({
            compilerOptions: {
                baseUrl: './',
                paths: {
                    "src/*": ['src/*'],
                    "components/*": ['src/components/*'],
                    "test/*": ["test1/*"]
                }
            }
        })
    })
})