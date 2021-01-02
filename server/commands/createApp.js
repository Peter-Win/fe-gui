const fs = require('fs')
const {CommonInfo} = require('../CommonInfo')
const {entities} = require('../entity/all')
const {sortByDepends} = require('../sysUtils/sortByDepends')
const {wsSend} = require('../wsServer')
const {makeFullName, isFileExists} = require('../fileUtils')

const createEntity = async (entityId) => {
    try {
        if (!(entityId in entities)) throw new Error(`Invalid entity: ${entityId}`)
        const entity = entities[entityId]
        const {name} = entity
        wsSend('createEntityBegin', name)
        console.log('create entity ', name)
        await entity.create()
        entity.isInit = true
        wsSend('createEntityEnd', {name, status: 'Ok'})
        return true
    } catch (e) {
        console.error(e)
        wsSend('createEntityEnd', {name: entityId, status: 'Error', message: e.message})
        return false
    }
}

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
        if (!await createEntity('PackageJson')) return false
        if (CommonInfo.isYarn) {
            if (!await createEntity('Yarn')) return false
        }
        if (!await createEntity('WebPack')) return false

        const transpiler = tech.transpiler
        if (transpiler in {Babel:1, TypeScript:1}) {
            if (!await createEntity(transpiler)) return false
        }

        // stylers...
        if (tech.styleCss) {
            if (!await createEntity('CSS')) return false
        }
        if (tech.styleLess) {
            if (!await createEntity('LESS')) return false
        }

        if (tech.framework === 'React') {
            if (!await createEntity('React')) return false
        }

        // Update entities ready flags
        wsSend('createEntityMsg', {message: 'Update entities info...'})
        const entList = sortByDepends(entities).filter(e => !e.isInit)
        console.log('Update entities ready flags')
        await Promise.all(entList.map(async (e) => await e.init()))
        // for (const e of entList) {
        //     if (!e.isInit) {
        //         await e.init()
        //     }
        // }
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