/*
 Storybook and LESS
 */

const {wsSendCreateEntity} = require('../../wsSend')
const {makeFullName} = require('../../fileUtils')
const {readRows, writeRows} = require('../../sysUtils/textFile')
const {injectImport} = require('../../parser/injectImport')

module.exports.storybookLess = async (name, entities) => {
    const {Storybook} = entities
    wsSendCreateEntity(this.name, 'Adding support for LESS to the Storybook configuration')

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
    await Storybook.addRule('/\\.less$/', use)

    // Update ./storybook/preview.js
    const previewName = makeFullName('.storybook/preview.js')
    const previewRows = await readRows(previewName)
    injectImport(previewRows, 'import "../src/style.less";')
    await writeRows(previewName, previewRows)
}