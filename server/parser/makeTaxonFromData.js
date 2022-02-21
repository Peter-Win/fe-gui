const { TxConst } = require('./taxons/TxConst')
const { TxArray } = require('./taxons/TxArray')
const { TxObject } = require('./taxons/TxObject')
const { Style } = require('./Style')

/**
 * Сформировать структуру таксонов из данных
 * В отличие от JSON, поддерживаются регэкспы
 * @param {Object|Array|RegExp|string|number|boolean|null} data
 * @param {Style} style
 * @returns {Taxon}
 */
const makeTaxonFromData = (data, style) => {
    if (data === undefined) {
        return TxConst.create('undefined', 'undefined')
    }
    if (data === null) {
        return TxConst.create('null', 'null')
    }
    if (typeof data in {number:1, boolean:1}) {
        return TxConst.create(typeof data, data.toString())
    }
    if (typeof data === 'string') {
        const st = style || new Style()
        return TxConst.create('string', st.string(data))
    }
    if (data instanceof RegExp) {
        return TxConst.create('regexp', data.toString())
    }
    if (Array.isArray(data)) {
        const taxon = new TxArray()
        data.forEach((item) => taxon.addTaxon(makeTaxonFromData(item, style)))
        return taxon
    }
    if (typeof data === "object") {
        const taxon = new TxObject()
        Object.entries(data).forEach(([key, value]) => {
            taxon.addObjectItem(key, makeTaxonFromData(value, style))
        })
        return taxon
    }
    throw new Error(`Cant make taxon from ${typeof data}`)
}

module.exports = { makeTaxonFromData }