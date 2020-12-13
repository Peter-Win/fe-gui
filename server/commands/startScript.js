const {asyncExec} = require('../sysUtils/asyncExec')
const {makeScriptCommand} = require('../sysUtils/makeScriptCommand')
const {wsSend} = require('../wsServer')

module.exports.startScript = async (name) => {
    const cmd = makeScriptCommand(name)
    await asyncExec(`start ${cmd}`)
    wsSend('scriptFinished', name)
}