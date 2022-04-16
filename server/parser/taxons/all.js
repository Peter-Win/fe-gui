const {TxArguments} = require('./TxArguments')
const {TxArray} = require('./TxArray')
const {TxArrayDestruct} = require('./TxArrayDestruct')
const {TxArrowFunc} = require('./TxArrowFunc')
const {TxBinOp} = require('./TxBinOp')
const {TxBody} = require('./TxBody')
const {TxBrackets} = require('./TxBrackets')
const {TxConst} = require('./TxConst')
const {TxField} = require('./TxField')
const {TxFnCall} = require('./TxFnCall')
const {TxIf} = require('./TxIf')
const {TxIndex} = require('./TxIndex')
const {TxModule} = require('./TxModule')
const {TxName} = require('./TxName')
const {TxObject} = require('./TxObject')
const {TxObjectDestruct} = require('./TxObjectDestruct')
const {TxPostfix} = require('./TxPostfix')
const {TxReturn} = require('./TxReturn')
const {TxTernOp} = require('./TxTernOp')
const {TxUnOp} = require('./TxUnOp')
const {TxVarDecl} = require('./TxVarDecl')

const taxonsMap = {
    TxArguments,
    TxArray,
    TxArrayDestruct,
    TxArrowFunc,
    TxBinOp,
    TxBody,
    TxBrackets,
    TxConst,
    TxField,
    TxFnCall,
    TxIf,
    TxIndex,
    TxModule,
    TxName,
    TxObject,
    TxObjectDestruct,
    TxPostfix,
    TxReturn,
    TxTernOp,
    TxUnOp,
    TxVarDecl,
}

const createTaxonByType = (txType) => {
    const constr = taxonsMap[txType]
    if (!constr) {
        throw new Error(`Invalid taxon type: "${txType}"`)
    }
    const taxon = new constr()
    taxon.type = txType
    return taxon
}

module.exports = {createTaxonByType}