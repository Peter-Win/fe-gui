const fs = require('fs')
const {CommonInfo} = require('./CommonInfo')
const {makeFullName} = require('./fileUtils')
const {wsSend, wsOn} = require('./wsServer')

const startAnalyse = async () => {
    CommonInfo.setGlobalStatus(CommonInfo.glbStLoad)
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
}
module.exports = { startAnalyse }