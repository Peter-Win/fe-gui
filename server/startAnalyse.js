const fs = require('fs')
const {CommonInfo} = require('./CommonInfo')
const {makeFullName} = require('./fileUtils')
const {wsSend, wsOn} = require('./wsServer')

const startAnalyse = async () => {
    const {entities} = require('./entity/all')
    const {sortByDepends} = require('./sysUtils/sortByDepends')
    const entList = sortByDepends(entities)
    CommonInfo.setGlobalStatus(CommonInfo.glbStLoad)
    /*
    // Необходимо проверить наличие файла package.json
    // Если такого файла нет, то проект еще не создан.
    const fPackageJson = makeFullName('package.json')
    try {
        await fs.promises.access(fPackageJson, fs.constants.R_OK)
    }catch(e){
        if (e.code === 'ENOENT') {
            CommonInfo.setGlobalStatus(CommonInfo.glbStInit)
        } else {
            CommonInfo.setGlobalStatus(CommonInfo.glbStError)
            wsOn('startAnalyse', startAnalyse)
            wsSend('errorAsJson', e)
        }
        return
    }
    console.log(fPackageJson, 'exists')
     */
    setTimeout(async () => {
        try {
            for (let i = 0; i < entList.length; i++) {
                const curEntity = entList[i];
                console.log('- init of ', curEntity.name)
                await curEntity.init()
                if (!curEntity.isInit) {
                    break
                }
            }
            // Признак создания нового проекта ищем в вебпаке
            const status = entities.WebPack.canCreateNewProject ? CommonInfo.glbStInit : CommonInfo.glbStReady
            setTimeout(() => CommonInfo.setGlobalStatus(status), 1000)
        } catch (e) {
            wsSend('statusMessage', {text: e.message, type: 'err'})
        }
    }, 1)
}
module.exports = { startAnalyse }