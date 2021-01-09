const {wsSend} = require('../wsServer')
const {makePostFxList} = require('../entity/postFx/makePostFxList')
const {postFx} = require('../entity/postFx')
const {sortByDepends} = require('../sysUtils/sortByDepends')

const doPostFx = async (entityId, entities) => {
    const fxList = makePostFxList(entityId, entities, postFx)
    console.log('Found post fx for', entityId, ':', fxList.length)
    for (const fx of fxList) {
        const name = fx.ids.join('+')
        try {
            wsSend('createEntityBegin', name)
            await fx.fn(name, entities)
            wsSend('createEntityEnd', {name, status: 'Ok'})
        } catch (e) {
            wsSend('createEntityEnd', {name, status: 'Error', message: e.message})    
            return false
        }
    }
    return true
}

/**
 * 
 * @param {Object<string, {name: string, isInit:boolean, isReady:boolean, 
 * init:function():Promise<void>, create:function(params?:Object):Promise<void>}>} entities 
 * @param {string} entityId 
 * @param {Object} params
 * @returns {Promise<boolean>}
 */
const createEntity = async (entities, entityId, params) => {
    try {
        if (!(entityId in entities)) throw new Error(`Invalid entity: ${entityId}`)
        const entity = entities[entityId]
        const {name} = entity
        wsSend('createEntityBegin', name)
        await entity.create(params)
        const {PackageJson} = entities
        if (PackageJson.isInit) {
            await PackageJson.load()
        }
        entity.isInit = false
        entity.isReady = false
        await entity.init()
        wsSend('createEntityEnd', {name, status: 'Ok'})
        await doPostFx(name, entities)
        return true
    } catch (e) {
        console.error(e)
        wsSend('createEntityEnd', {name: entityId, status: 'Error', message: e.message})
        return false
    }
}

const updateEntitiesState = async (entities) => {
    const entList = sortByDepends(entities).filter(e => !e.isInit)
    console.log('Update entities ready flags')
    await Promise.all(entList.map(async (e) => await e.init()))
}
module.exports = {createEntity, updateEntitiesState}