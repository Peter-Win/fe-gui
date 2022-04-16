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
     * @param {number} index
     * @return {Taxon}
     */
    addTaxon(subTax, index = -1) {
        if (index < 0) {
            this.subTaxons.push(subTax)
        } else {
            this.subTaxons.splice(index, 0, subTax)
        }
        subTax.owner = this
        return subTax
    }

    remove() {
        if (this.owner) {
            const pos = this.owner.subTaxons.indexOf(this)
            if (pos >= 0) this.owner.subTaxons.splice(pos, 1)
        }
        this.owner = null
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

    /**
     * Поиск объявления переменной вверх
     * @param {string} name 
     * @returns {Taxon|null} 
     */
    findDeclarationUp(name) {
        const result = this.findDeclarationDown(name)
        if (result) return result
        return this.owner ? this.owner.findDeclarationUp(name) : null
    }
    /** Поиск вниз может осуществляться только в некоторых типах таксонов. 
     * Например в объявлении функции поиск среди параметров. А в блоке - поиск инструкций const/let/var
     * Т.е. функция переопределяется в наследниках.
     * @param {string} name
     * @returns {Taxon|null}
     */
    findDeclarationDown(name) {
        return null
    }
}

module.exports = {Taxon}