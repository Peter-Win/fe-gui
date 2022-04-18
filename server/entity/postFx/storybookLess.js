/*
 Storybook and LESS
 */

const {wsSendCreateEntity} = require('../../wsSend')
const {makeFullName} = require('../../fileUtils')
const {injectStyleImport} = require('../../sysUtils/injectStyleImport')

module.exports.storybookLess = async (name, entities) => {
    const {Storybook, LESS} = entities
    wsSendCreateEntity(name, 'Adding support for LESS to the Storybook configuration')

    // Модификация .storybook/main.js
    const use = [
        'style-loader',
        'css-loader',
        {
            loader: 'less-loader',
            options: {
                lessOptions: {
                    javascriptEnabled: true,
                },
            },
        },
    ]
    await Storybook.addRule('/\\.less$/', use, (msg) => wsSendCreateEntity(name, `  ${msg}`))

    // Update ./storybook/preview.js
    const {shortName} = await LESS.checkStyleLess((msg, t) => wsSendCreateEntity(name, msg, t))
    await injectStyleImport({
        dstFileName: makeFullName('.storybook/preview.js'),
        styleNameForImport: `../src/${shortName}`,
        log: (msg, type) => wsSendCreateEntity(name, msg, type),
    })
}