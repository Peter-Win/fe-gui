const fs = require('fs')
const {CommonInfo} = require('../CommonInfo')
const {entities} = require('../entity/all')
const {wsSend} = require('../wsServer')
const {makeFullName, isFileExists} = require('../fileUtils')
const {createEntity, updateEntitiesState} = require('./createEntity')
const {updateGitIgnoreFileMsg} = require('./updateGitIgnore')

const createApp = async (data) => {
    try {
        console.log('Start create application')
        CommonInfo.onCreateApp(data)
        const {info, tech} = CommonInfo

        // Создание папки src. Пока не ясно, какой сущности это лучше делать. Поэтому делаем здесь.
        const srcPath = makeFullName('src')
        if (!await isFileExists(srcPath)) {
            wsSend('createEntityMsg', {message: `create ${srcPath}`, type: 'info'})
            await fs.promises.mkdir(srcPath);
        }

        // Создание сущностей
        if (!await createEntity(entities, 'PackageJson')) return false
        if (CommonInfo.isYarn) {
            if (!await createEntity(entities, 'Yarn')) return false
        }
        if (!await createEntity(entities, 'WebPack')) return false
        if (!await createEntity(entities, 'Readme')) return false

        const transpiler = tech.transpiler
        if (transpiler in {Babel:1, TypeScript:1}) {
            if (!await createEntity(entities, transpiler)) return false
        }

        // stylers...
        if (tech.styleCss) {
            if (!await createEntity(entities, 'CSS')) return false
        }
        if (tech.styleLess) {
            if (!await createEntity(entities, 'LESS')) return false
        }

        if (tech.framework === 'React') {
            if (!await createEntity(entities, 'React')) return false
        }

        if (tech.vcs.toLowerCase() === 'git') {
            await updateGitIgnoreFileMsg()
        }

        // Update entities ready flags
        wsSend('createEntityMsg', {message: 'Update entities info...'})
        await updateEntitiesState(entities)

    } catch (e) {
        console.error('createApp error=', e)
        wsSend('createEntityMsg', {message: e.message, type: 'err'})
        return false
    }
    wsSend('createEntityMsg', {message: 'SUCCESS FINISH', type: 'success'})
    setTimeout(() => {
        CommonInfo.send()
        CommonInfo.setGlobalStatus(CommonInfo.glbStReady)
    }, 1000)
    return true
}

module.exports = {createApp}