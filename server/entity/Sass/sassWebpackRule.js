const src = `{
  module: {
    rules: [
      {
        test: /\\.s[ac]ss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
}`

const srcMap = `{
  module: {
    rules: [
      {
        test: /\\.s[ac]ss$/,
        use: [
          'style-loader',
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
            },
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
}`
  
/**
 * @param {Object} params
 * @param {boolean} params.useSourceMap
 */
const sassWebpackRule = (params) => {
    return params.useSourceMap ? srcMap : src
}

module.exports = {sassWebpackRule}