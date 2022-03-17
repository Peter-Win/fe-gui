const isValid = (entity) => {
    if (!entity) return false
    return entity.isInit || entity.isVisible
}

/**
 * Build post effects list for specified entity
 * @param {string} name 
 * @param {Object<string, {isInit: boolean, name: string}>} entities 
 * @param {{ids:string[], fn:function():Promise<void>}[]} postFx 
 * @returns {{ids:string[], fn:function():Promise<void>}[]}
 */
const makePostFxList = (name, entities, postFx) => postFx.filter(({ids}) => {
    if (!ids.includes(name)) return false
    const rest = ids.filter(id => id !== name)
    const cnt = rest.reduce((sum, id) => sum + isValid(entities[id]) ? 1:0, 0)
    return cnt === ids.length - 1
})

module.exports = {makePostFxList}