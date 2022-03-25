const { findRule } = require('../WebPack.utils')
const { TxConst } = require('../../parser/taxons/TxConst')
const { wsSendCreateEntity } = require('../../wsSend')

module.exports.cssModulesLess = async (name, entities) => {
    // Если LESS ставится после применения CSS Модулей для LESS,
    // то необходимо добавить exclude в правило Webpack, где указан лоадер для LESS
    const { WebPack } = entities
    const wpConfig = await WebPack.loadConfigTaxon()
    const ruleLess = findRule(wpConfig, '.less')
    if (ruleLess) {
        const excludeValue = TxConst.create('regexp', '/\\.module\\.less$/')
        ruleLess.changeObjectItem('exclude', 'exclude', excludeValue, WebPack.getStyle())
        await WebPack.saveConfigTaxon(wpConfig)
        wsSendCreateEntity(name, `Updated ${WebPack.getConfigName()}`)
    } else {
        console.log("ruleLess is not found")
    }
}