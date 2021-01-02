const {PackageJson} = require('./PackageJson')
const {WebPack} = require('./WebPack')
const {Yarn} = require('./Yarn')
const {Babel} = require('./Babel')
const {TypeScript} = require('./TypeScript')
const {React} = require('./React')
const {CSS} = require('./CSS')
const {LESS} = require('./LESS')
const {Jest} = require('./Jest')
const {ESLint} = require('./ESLint')

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
reg(React)
reg(CSS)
reg(LESS)
reg(Jest)
reg(ESLint)

module.exports = {entities}