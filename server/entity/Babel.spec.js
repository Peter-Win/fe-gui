const {expect} = require('chai')
const {updatePresetEx} = require('./Babel')

describe('updatePresetEx', () => {
    it('simple', () => {
        const config = {
            "presets": [
                "@babel/preset-env"
            ]
        }
        updatePresetEx(config, '@babel/preset-react')
        expect(config).to.eql({presets: ['@babel/preset-env', '@babel/preset-react']})
    })
    it("empty", () => {
        const config = {}
        updatePresetEx(config, '@babel/preset-react')
        expect(config).to.eql({presets: ['@babel/preset-react']})
    })
})