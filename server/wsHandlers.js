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
        await createApp(data)
    })
    wsOn('askScripts', async (data) => {
        const {entities: {PackageJson}} = require('./entity/all')
        await PackageJson.load()
        wsSend('scriptsDict', {scripts: PackageJson.data.scripts})
    });
    wsOn('startScript', async (name) => {
        const {startScript} = require('./commands/startScript')
        await startScript(name)
    })
    wsOn('readyEntitiesAsk', async () => {
        const {entities} = require('./entity/all')
        const {sortByDepends} = require('./sysUtils/sortByDepends')
        const ready = sortByDepends(entities).filter(entity => entity.isReady)
        wsSend('readyEntities', ready.map(e => ({name: e.name})))
    })
    wsOn('startUpgrade', async (name) => {
        // нельзя поднять, т.к. внутри зависимость на wsServer
        const {upgradeApp} = require('./commands/upgradeApp')
        await upgradeApp(name)
    })
    wsOn('upgradePromptAsk', async (name) => {
        const {sendUpgradeInfo} = require('./commands/upgradeApp')
        await sendUpgradeInfo(name)
    })
    wsOn('upgradeCancel', async () => {
        const {CommonInfo} = require('./CommonInfo')
        CommonInfo.setGlobalStatus(CommonInfo.glbStReady)
        CommonInfo.send()
    })
    wsOn('upgradeEntity', async ({name, params}) => {
        const {onUpgrade} = require('./commands/upgradeApp')
        const {CommonInfo} = require('./CommonInfo')
        CommonInfo.setGlobalStatus(CommonInfo.glbStCreate)
        await onUpgrade(name, params)
    })
    wsOn('setReady', async () => {
        const {CommonInfo} = require('./CommonInfo')
        CommonInfo.send()
        CommonInfo.setGlobalStatus(CommonInfo.glbStReady)
    })
}

module.exports = {wsHandlers}