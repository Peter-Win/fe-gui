const {expect} = require('chai')
const { parseModule } = require('../parser/parseExpression')
const { ReaderCtx } = require('../parser/ReaderCtx')
const { Style } = require('../parser/Style')
const { formatChunks } = require('../parser/WriterCtx')
const {changeWebPackConfig} = require('./conditionalReactDomAlias')
const {compareText} = require('../sysUtils/compareText')

describe('changeWebPackConfig', () => {
  it('minimalistic', () => {
    const src = 
`module.exports = {
  entry: './src/index.tsx',
}`
    const dst =
`const config = {
  entry: './src/index.tsx',
  resolve: {
    alias: {
    },
  },
};
module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.resolve.alias['react-dom'] = '@hot-loader/react-dom';
  }
  return config;
}
`
    const wpConfig = parseModule(ReaderCtx.fromText(src)).createTaxon()
    const style = new Style()
    style.singleQuote = true
    const res = changeWebPackConfig(wpConfig, style)
    expect(res).to.be.undefined
    const chunks = []
    wpConfig.exportChunks(chunks, style)
    const changed = formatChunks(chunks, style)
    compareText(changed, dst)
  })
  it('Remove react-dom', () => {
    const src =
`module.exports = {
  entry: './src/index.tsx',
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
      src: 'src',
    },
  },
}`
    const dst =
`const config = {
  entry: './src/index.tsx',
  resolve: {
    alias: {
      src: 'src',
    },
  },
};
module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.resolve.alias['react-dom'] = '@hot-loader/react-dom';
  }
  return config;
}
`
    const wpConfig = parseModule(ReaderCtx.fromText(src)).createTaxon()
    const style = new Style()
    style.singleQuote = true
    const res = changeWebPackConfig(wpConfig, style)
    expect(res).to.be.undefined
    const chunks = []
    wpConfig.exportChunks(chunks, style)
    const changed = formatChunks(chunks, style)
    compareText(changed, dst)
  })
})