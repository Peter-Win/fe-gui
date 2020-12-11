const fs = require('fs')
const {CommonInfo} = require('../CommonInfo')
const {entities} = require('../entity/all')
const {wsSend} = require('../wsServer')
const {makeFullName} = require('../fileUtils')

const createEntity = async (entity) => {
    const {name} = entity
    wsSend('createEntityBegin', name)
    try {
        console.log('create entity ', name)
        await entity.create()
        wsSend('createEntityEnd', {name, status: 'Ok'})
        return true
    } catch (e) {
        wsSend('createEntityEnd', {name, status: 'Error', message: e.message})
        return false
    }
}

const createApp = async (data) => {
    try {
        console.log('Start create application')
        CommonInfo.onCreateApp(data)
        const {info} = CommonInfo

        // Создание папки src. Пока не ясно, какой сущности это лучше делать. Поэтому делаем здесь.
        const srcPath = makeFullName('src')
        try {
            await fs.promises.access(srcPath, fs.constants.F_OK)
        } catch (e) {
            if (e.code === 'ENOENT') {
                wsSend('createEntityMsg', {message: `create ${srcPath}`, type: 'info'})
                await fs.promises.mkdir(srcPath);
            } else {
                throw e
            }
        }

        // Создание сущностей
        if (!await createEntity(entities.PackageJson)) return false
        if (CommonInfo.isYarn) {
            if (!await createEntity(entities.Yarn)) return false
        }
        if (!await createEntity(entities.WebPack)) return false
    } catch (e) {
        console.error('createApp error=', e.message)
        wsSend('createEntityMsg', {message: e.message, type: 'err'})
        return false
    }
    wsSend('createEntityMsg', {message: 'SUCCESS FINISH', type: 'success'})
    return true
}

module.exports = {createApp}