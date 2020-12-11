const {PackageJson} = require('./PackageJson')
const {WebPack} = require('./WebPack')
const {Yarn} = require('./Yarn')

const entities = {}

const reg = (Constr) => {
    const inst = new Constr()
    entities[inst.name] = inst
}
reg(PackageJson)
reg(Yarn)
reg(WebPack)

module.exports = {entities}