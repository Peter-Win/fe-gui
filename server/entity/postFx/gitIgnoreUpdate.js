const {updateGitIgnoreFileMsg} = require('../../commands/updateGitIgnore')

module.exports.gitIgnoreUpdate = async (name, entities) => {
    await updateGitIgnoreFileMsg(name);
}