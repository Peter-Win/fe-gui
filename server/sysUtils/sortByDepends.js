// Важно вести обработку списка сущностей в определенном порядке
// Потому что нельзя начинать обработку сущности раньше, чем обработаны те, от кого она зависит.

/**
 *
 * @param {Object<string,{name:string, depends:string[]}>} entities
 * @return {{name:string, depends:string[], isInit:boolean, isReady:boolean}[]}
 */
const sortByDepends = (entities) => {
    const dict = {...entities}
    const result = []
    for (;;) {
        const list = Object.values(dict)
        if (list.length === 0) {
            break
        }
        let item = list[0]
        for (;;) {
            const ownerId = item.depends.find(id => dict[id])
            if (!ownerId) break
            item = dict[ownerId]
        }
        delete dict[item.name]
        result.push(item)
    }
    return result
}

module.exports = {sortByDepends}