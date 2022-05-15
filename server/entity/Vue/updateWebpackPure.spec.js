const {expect} = require('chai')
const {updateWebpackPure} = require('./updateWebpack')
const {Style} = require('../../parser/Style')
const {formatChunks} = require('../../parser/WriterCtx')
const {compareText} = require('../../sysUtils/compareText')

const src = 
`module.exports = {
  module: {
    rules: [
      {
        test: /\\.tsx?$/,
        loader: 'ts-loader',
      },
      {
        test: /\\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
}`

const dst =
`const {VueLoaderPlugin,} = require("vue-loader");
module.exports = {
  module: {
    rules: [
      {
        test: /\\.tsx?$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [
            /\\.vue$/,
          ],
        },
      },
      {
        test: /\\.css$/,
        use: [
          "vue-style-loader",
          'css-loader',
        ],
      },
      {
        test: /\\.vue$/,
        loader: "vue-loader",
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
  ],
};
`

describe('updateWebpackPure', () => {
    const style = new Style()
    it('default', () => {
        const wp = updateWebpackPure(src.split('\n'), style, true)
        const chunks = []
        wp.exportChunks(chunks, style)
        const result = formatChunks(chunks, style)
        compareText(result, dst)
    })
})