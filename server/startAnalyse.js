const fs = require('fs')
const {CommonInfo} = require('./CommonInfo')
const {wsSend} = require('./wsServer')
const {isFileExists, makeSrcName, makeFullName} = require('./fileUtils')

const locateIndexExt = async () => {
    if (! await isFileExists(makeFullName('src'))) return ''
    const exts = ['tsx', 'ts', 'jsx', 'js']
    for (const ext of exts) {
        if (await isFileExists(makeSrcName(`index.${ext}`))) return ext
    }
    return ''
}


const startAnalyse = async () => {
    const {entities} = require('./entity/all')
    const {sortByDepends} = require('./sysUtils/sortByDepends')
    const entList = sortByDepends(entities)
    CommonInfo.setGlobalStatus(CommonInfo.glbStLoad)
    const indexExt = await locateIndexExt()
    if (indexExt[0] === 't') CommonInfo.tech.language = 'TypeScript'
    setTimeout(async () => {
        try {
            // Здесь проставляются флаги isInit и isReady
            for (const curEntity of entList) {
                // console.log(`1:`, curEntity.name)
                await curEntity.init()
            }
            // Бывает, что флаг isReady выставляется неправильно, т.к. CommonInfo еще не заполнен
            for (const curEntity of entList) {
                await curEntity.init()
            }
            // Признак создания нового проекта ищем в вебпаке
            const status = entities.WebPack.canCreateNewProject ? CommonInfo.glbStInit : CommonInfo.glbStReady
            setTimeout(() => {
                CommonInfo.setGlobalStatus(status)
                CommonInfo.send()
                entList.forEach(e => {
                    if (e.isReady) console.log(` * _${e.name}_ ready`)
                })
            }, 1000)
        } catch (e) {
            wsSend('statusMessage', {text: e.message, type: 'err'})
        }
    }, 1)
}
module.exports = { startAnalyse }