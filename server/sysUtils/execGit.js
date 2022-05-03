const {asyncExecShell} = require('./asyncExec')

const execGit = async (name, command) => {
    const cmdExt = `git ${command}`
    await asyncExecShell(name, cmdExt)
}
module.exports = {execGit}