const {parseExpression, parseModule} = require('../parser/parseExpression')
const {ReaderCtx} = require('../parser/ReaderCtx')
const {Style} = require('../parser/Style')
const {formatChunks} = require('../parser/WriterCtx')
const {TxObject} = require('../parser/taxons/TxObject')

// Вообщем так делать неправильно,
// т.к. один и тот же идентификатор может появляться в разных контекстах.
// Но будем считать, что в конфиге идентификаторы не повторяются.
const findAssign = (moduleTaxon, name) => {
    const assigns = []
    moduleTaxon.walk(taxon => {
        if (
            taxon.type === 'TxBinOp' &&
            taxon.opcode === '=' &&
            taxon.left.type === 'TxName' &&
            taxon.left.name === name
        ) {
            assigns.push(taxon.right)
        }
    })
    if (assigns.length === 0) throw new Error(`"${name}" not found`)
    if (assigns.length > 1) throw new Error(`Too complex config with multiple "${name}"`)
    return assigns[0]
}

/**
 * Поиск главного объекта конфига
 * @param {Taxon} moduleTaxon
 * @return {TxExpression}
 */
const findConfigRoot = (moduleTaxon) => {
    const exp = []
    moduleTaxon.walk((taxon) => {
        if (taxon.type === 'TxBinOp' && taxon.opcode === '.') {
            const {left, right} = taxon
            if (left.name === 'module' && right.field === 'exports') {
                exp.push(taxon)
            }
        }
    })
    // Желательно получить конструкцию module.exports = ...
    if (exp.length === 1 && exp[0].owner.type === 'TxBinOp' && exp[0].owner.opcode === '=') {
        return exp[0].owner.right
    }
    // Теоретически, можно ожидать module.exports.entry и другие разделы.
    // Но мне такие конфиги не встречались/
    throw new Error('Unsupported structure of webpack.config.js')
}

/**
 * Внедрить объект addition в source
 * @param {TxObject} source. Может быть декомпозирован (т.е вместо значений могут быть переменные)
 * @param {TxObject} addition. Должен быть plain object
 * @return {void}
 */
const mergeObjectTaxons = (source, addition) => {
    const style = new Style()
    addition.items.forEach((additionItem) => {
        const key = additionItem.key.exportText(style)
        const additionValue = additionItem.value
        if (!additionValue) throw new Error('Expected plain object for addition')
        if (!(key in source.dict)) {
            // Проще всего, когда ключ новый для source
            source.addObjectItem(key, additionValue)
            return
        }
        const sourcePart = source.dict[key]
        if (sourcePart.type === 'TxObject' && additionValue.type === 'TxObject') {
            mergeObjectTaxons(sourcePart, additionValue)
            return
        }
        if (sourcePart.type === 'TxArray' && additionValue.type === 'TxArray') {
            additionValue.subTaxons.forEach(item => {
                sourcePart.addTaxon(item)
            })
            return
        }
        throw new Error(`Can't merge ${sourcePart.type} with ${additionValue.type}`)
    })
}

/**
 * Добавление новых разделов в конфиг вебпака
 * @param {string} sourceConfig
 * @param {string} addition
 * @return {string}
 */
const merge = (sourceConfig, addition) => {
    const sourceNode = parseModule(ReaderCtx.fromText(sourceConfig))
    const sourceTaxon = sourceNode.createTaxon()
    // TODO: Пока что довольно простой анализ
    let configTaxon = findConfigRoot(sourceTaxon)
    if (configTaxon.type === 'TxName') {
        // Если конфиг выделен в отдельную переменную, то найти ее объявдение
        configTaxon = findAssign(sourceTaxon, configTaxon.name)
    }
    if (configTaxon.type !== 'TxObject') {
        throw new Error('Too complex webpack.config.js. Root object not found')
    }

    const additionNode = parseExpression(ReaderCtx.fromText(addition))
    const additionTaxon = additionNode.createTaxon()
    if (additionTaxon.type !== 'TxObject') {
        throw new Error('Invalid addition type. Object expected instead of '+additionTaxon.type)
    }

    mergeObjectTaxons(configTaxon, additionTaxon)

    const style = new Style()
    const chunks = []
    sourceTaxon.exportChunks(chunks, style)
    return formatChunks(chunks, style)
}

const findObjectItem = (taxon, key) => {
    if (taxon instanceof TxObject) {
        // Это самый удачный вариант. Объект объявлен в явном виде.
        return taxon.dict[key]
    }
    if (taxon.type === 'TxName') {
    }
    throw new Error()
}

/**
 * Поиск вложенного таксона
 * @param {Taxon} taxon
 * @param {string} path
 * @return {Taxon}
 */
const findPath = (taxon, path) => {
    const pathList = path.split('.')
    return pathList.reduce((owner, key) => {
        const result = findObjectItem(owner, key)
        if (!result) throw new Error(`Can't find path "${path}"`)
        return result
    }, taxon)
}

const findRule = (sourceTaxon, name) => {
    // const sourceNode = parseModule(ReaderCtx.fromText(sourceConfig))
    // const sourceTaxon = sourceNode.createTaxon()
    const rootTaxon = findConfigRoot(sourceTaxon)
    let rulesTaxon = findPath(rootTaxon, 'module.rules')
    if (rulesTaxon.type === 'TxName') {
        rulesTaxon = findAssign(sourceTaxon, rulesTaxon.name)
    }
    if (rulesTaxon.type !== 'TxArray') {
        throw new Error(`Invalid type of rules ${rulesTaxon.type}`)
    }
    return rulesTaxon.subTaxons.find(taxon => {
        if (!taxon || taxon.type !== 'TxObject') return false
        const txTest = findObjectItem(taxon, 'test')
        if (!txTest || txTest.type !== 'TxConst' || txTest.constType !== 'regexp') return false
        const rx = txTest.getRealValue()
        return rx.test(name)
    })
}

module.exports = {findAssign, findConfigRoot, findPath, findRule, mergeObjectTaxons, merge}