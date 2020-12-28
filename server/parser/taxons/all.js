const {TxArguments} = require('./TxArguments')
const {TxArray} = require('./TxArray')
const {TxArrayDestruct} = require('./TxArrayDestruct')
const {TxBinOp} = require('./TxBinOp')
const {TxBody} = require('./TxBody')
const {TxBrackets} = require('./TxBrackets')
const {TxConst} = require('./TxConst')
const {TxField} = require('./TxField')
const {TxFnCall} = require('./TxFnCall')
const {TxIndex} = require('./TxIndex')
const {TxModule} = require('./TxModule')
const {TxName} = require('./TxName')
const {TxObject} = require('./TxObject')
const {TxObjectDestruct} = require('./TxObjectDestruct')
const {TxPostfix} = require('./TxPostfix')
const {TxTernOp} = require('./TxTernOp')
const {TxUnOp} = require('./TxUnOp')
const {TxVarDecl} = require('./TxVarDecl')

const taxonsMap = {
    TxArguments,
    TxArray,
    TxArrayDestruct,
    TxBinOp,
    TxBody,
    TxBrackets,
    TxConst,
    TxField,
    TxFnCall,
    TxIndex,
    TxModule,
    TxName,
    TxObject,
    TxObjectDestruct,
    TxPostfix,
    TxTernOp,
    TxUnOp,
    TxVarDecl,
}

const createTaxonByType = (txType) => {
    const constr = taxonsMap[txType]
    if (!constr) {
        // console.log('%%%', taxonsMap)
        throw new Error(`Invalid taxon type: "${txType}"`)
    }
    return new constr()
}

module.exports = {createTaxonByType}