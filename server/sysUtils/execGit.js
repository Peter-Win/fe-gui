const {asyncExec} = require('./asyncExec')
const {wsSendCreateEntity} = require('../wsSend')

const execGit = async (name, command) => {
    const cmdExt = `git ${command}`
    wsSendCreateEntity(name, cmdExt)
    const {stdout, stderr} = await asyncExec(cmdExt)
    if (typeof stderr === 'string' && stderr.trim()) {
        wsSendCreateEntity(name, stderr, 'warn')
    }
}
module.exports = {execGit}