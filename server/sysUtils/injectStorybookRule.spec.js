const {expect} = require('chai')
const {injectStorybookRule} = require('./injectStorybookRule')

const split = (rows) => rows.split('\n').map(s => s.replace('\r', ''))

const str = (s) => JSON.stringify(s).replace(/ /g, '.');

const diff = (src, dst) => src
    .map((srcLine, i) => srcLine === dst[i] ? null : `${i}: ${str(srcLine)} <=> ${str(dst[i])}`)
    .filter(line => line !== null)

describe('injectStorybookRule', () => {
    it('Clean main.js', () => {
        const src = split(cleanConfig)
        const dst = injectStorybookRule(src, '/\\.less$/', ['style-loader', 'css-loader', 'less-loader'])
        expect(diff(dst, finalConfig)).to.be.eql([])
    })
    it('Clean main.js with trailing comma', () => {
        const src = split(cleanConfigWithComma)
        const dst = injectStorybookRule(src, '/\\.less$/', ['style-loader', 'css-loader', 'less-loader'])
        expect(diff(dst, finalConfig)).to.be.eql([])
    })
    it('Already have webpackFinal', () => {
        const src = split(configWithWebpack)
        const dst = injectStorybookRule(src, '/\\.less$/', ['style-loader', 'css-loader', 'less-loader'])
        expect(diff(dst, finalConfig)).to.be.eql([])
    })
})

const cleanConfig = `module.exports = {
    "stories": [
        "../src/**/*.stories.mdx",
    ],
    "addons": [
        "@storybook/addon-links",
    ]
}`
const cleanConfigWithComma = `module.exports = {
    "stories": [
        "../src/**/*.stories.mdx",
    ],
    "addons": [
        "@storybook/addon-links",
    ],
}`

const configWithWebpack = `module.exports = {
    "stories": [
        "../src/**/*.stories.mdx",
    ],
    "addons": [
        "@storybook/addon-links",
    ],
    webpackFinal: async (config) => {
        return config;
    },
}`

const finalConfig = split(`module.exports = {
    "stories": [
        "../src/**/*.stories.mdx",
    ],
    "addons": [
        "@storybook/addon-links",
    ],
    webpackFinal: async (config) => {
        config.module.rules.push({
            test: /\\.less$/,
            use: ["style-loader","css-loader","less-loader"],
        });
        return config;
    },
}`)