const {wsSend} = require('../wsServer')
const {CommonInfo} = require('../CommonInfo')
const {installPackage} = require('./installPackage')
/**
 *
 * @param {{packageName:string, dev:boolean}[]} packagesList
 * @return {Promise<void>}
 */
const installPackages = async (packagesList) => {
    CommonInfo.setGlobalStatus(CommonInfo.glbStCreate)
    const name = packagesList[0].packageName
    let message, status = ''
    wsSend('createEntityBegin', name)
    try {
        for (const item of packagesList) {
            await installPackage(name, item.packageName, item.dev)
        }
        // TODO: Возможно, нужен init всех сущностей
        status = 'Ok'
    } catch (e) {
        status = 'Error'
        message = e.message
    }
    wsSend('createEntityEnd', {name, status, message})
    wsSend('onCreateEnd')
}
module.exports = {installPackages}