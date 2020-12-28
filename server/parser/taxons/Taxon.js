class Taxon {
    name = ''
    subTaxons = []
    owner = null
    type = ''

    /**
     * @param {{name?:string}?} props
     */
    constructor(props = {}) {
        this.name = props.name || ''
    }

    /** @param {ParserNode} node */
    init(node) {
    }

    /**
     * @param {Taxon} subTax
     * @return {Taxon}
     */
    addTaxon(subTax) {
        this.subTaxons.push(subTax)
        subTax.owner = this
        return subTax
    }

    /**
     * @param {string[][]} chunks
     * @param {Style} style
     * @abstract
     */
    exportChunks(chunks, style) {
        throw new Error(`Abstract exportChunks "${this.type}"`)
    }

    exportPlain() {
        const obj = {}
        Object.keys(this).forEach(key => {
            const value = this[key]
            if (typeof value in {string: 1, number: 1, boolean: 1} && value !== '') {
                obj[key] = value
            }
        })
        if (this.subTaxons.length) {
            obj.items = this.subTaxons.map(tax => tax.exportPlain())
        }
        return obj
    }
    exportText(style) {
        const {formatChunks} = require('../WriterCtx')
        const chunks = []
        this.exportChunks(chunks, style)
        return formatChunks(chunks, style)
    }

    walk(onTaxon) {
        onTaxon(this)
        this.subTaxons.forEach(arg => arg.walk(onTaxon))
    }
}

module.exports = {Taxon}