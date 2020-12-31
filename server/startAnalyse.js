const fs = require('fs')
const {CommonInfo} = require('./CommonInfo')
const {wsSend} = require('./wsServer')

const startAnalyse = async () => {
    const {entities} = require('./entity/all')
    const {sortByDepends} = require('./sysUtils/sortByDepends')
    const entList = sortByDepends(entities)
    CommonInfo.setGlobalStatus(CommonInfo.glbStLoad)
    setTimeout(async () => {
        try {
            for (let i = 0; i < entList.length; i++) {
                const curEntity = entList[i];
                console.log('>', curEntity.name)
                // Не начинать инициализацию, если хотя бы одна зависимость не инициализирована
                if (curEntity.depends.find(name => !entities[name].isInit)) {
                    continue
                }
                await curEntity.init()
            }
            // Признак создания нового проекта ищем в вебпаке
            const status = entities.WebPack.canCreateNewProject ? CommonInfo.glbStInit : CommonInfo.glbStReady
            setTimeout(() => {
                CommonInfo.setGlobalStatus(status)
                CommonInfo.send()
            }, 1000)
        } catch (e) {
            wsSend('statusMessage', {text: e.message, type: 'err'})
        }
    }, 1)
}
module.exports = { startAnalyse }