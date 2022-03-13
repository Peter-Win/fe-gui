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
    wsOn('searchPackagesList', async (name) => {
        let err, packages = []
        try {
            packages = await npmSearch(name)
        } catch(e) {
            err = e
        }
        wsSend('searchPackagesListResponse', {name, packages, error: err && err.message})
    })
    wsOn('installPackages', async (data) => {
        const {installPackages} = require('./commands/installPackages')
        await installPackages(data)
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
    wsOn('readyEntitiesAsk', async () => {
        const {entities} = require('./entity/all')
        const {sortByDepends} = require('./sysUtils/sortByDepends')
        const ready = sortByDepends(entities).filter(entity => entity.isReady)
        wsSend('readyEntities', ready.map(e => ({name: e.name})))
    })
    wsOn('setReady', async () => {
        const {CommonInfo} = require('./CommonInfo')
        CommonInfo.send()
        CommonInfo.setGlobalStatus(CommonInfo.glbStReady)
    })
    wsOn('srcFoldersAsk', async () => {
        const {getSrcFolders} = require('./commands/srcFolders')
        const folders = await getSrcFolders()
        wsSend('srcFolders', folders)
    })
    wsOn('startScript', async (name) => {
        const {startScript} = require('./commands/startScript')
        await startScript(name)
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
}

module.exports = {wsHandlers}