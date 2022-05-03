const {CommonInfo} = require('../CommonInfo')

module.exports.makeScriptCommand = (name) => {
    return CommonInfo.packageManager.makeRun(name)
}