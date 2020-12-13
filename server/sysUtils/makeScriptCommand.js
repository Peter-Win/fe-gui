const {CommonInfo} = require('../CommonInfo')

module.exports.makeScriptCommand = (name) => {
    if (CommonInfo.isYarn) {
        return `yarn ${name}`
    }
    let cmd = 'npm '
    if (name !== 'test' && name !== 'start') {
        cmd += 'run '
    }
    return cmd + name
}