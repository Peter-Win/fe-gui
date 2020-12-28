const {PackageJson} = require('./PackageJson')
const {WebPack} = require('./WebPack')
const {Yarn} = require('./Yarn')
const {Babel} = require('./Babel')
const {TypeScript} = require('./TypeScript')

const entities = {}

const reg = (Constr) => {
    const inst = new Constr()
    entities[inst.name] = inst
}
reg(PackageJson)
reg(Yarn)
reg(WebPack)
reg(Babel)
reg(TypeScript)

module.exports = {entities}