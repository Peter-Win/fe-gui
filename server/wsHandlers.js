const {wsOn,wsSend} = require('./wsServer')
const {npmSearch} = require('./commands/npmSearch')

const wsHandlers = () => {
    wsOn('searchPackage', async (name) => {
        let err, package
        try {
            const list = await npmSearch(name)
            package = list.find(item => item.name === name)
        } catch(e) {
            err = e
        }
        wsSend('searchPackageResponse', {name, package, error: err && err.message})
    })
    wsOn('createApp', async (data) => {
        const {createApp} = require('./commands/createApp')
        createApp(data)
    })
    wsOn('askScripts', async (data) => {
        const {entities} = require('./entity/all')
        const {PackageJson} = entities
        wsSend('scriptsDict', {scripts: PackageJson.data.scripts})
    });
    wsOn('startScript', async (name) => {
        const {startScript} = require('./commands/startScript')
        await startScript(name)
    })
}

module.exports = {wsHandlers}