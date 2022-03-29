const {PackageJson} = require('./PackageJson')
const {Readme} = require('./Readme')
const {WebPack} = require('./WebPack')
const {Yarn} = require('./Yarn')
const {Babel} = require('./Babel')
const {TypeScript} = require('./TypeScript')
const {React} = require('./React')
const {ReactRouter} = require('./ReactRouter')
const {CSS} = require('./CSS')
const {LESS} = require('./LESS')
const {Jest} = require('./Jest')
const {ESLint} = require('./ESLint')
const {Standard} = require('./Standard')
const {Antd} = require('./Antd')
const {AntdLayout} = require('./AntdLayout')
const {Git} = require('./Git')
const {Husky} = require('./Husky')
const {Storybook} = require('./Storybook')
const {AssetModules} = require('./AssetModules')
const {Aliases} = require('./Aliases')
const {CssModules} = require('./CssModules')
const {ReactComponent} = require('./ReactComponent')

const entities = {}

const reg = (Constr) => {
    const inst = new Constr()
    entities[inst.name] = inst
}
reg(PackageJson)
reg(Readme)
reg(Yarn)
reg(WebPack)
reg(Babel)
reg(TypeScript)
reg(React)
reg(ReactRouter)
reg(CSS)
reg(LESS)
reg(Jest)
reg(ESLint)
reg(Standard)
reg(Antd)
reg(AntdLayout)
reg(Git)
reg(Husky)
reg(Storybook)
reg(AssetModules)
reg(Aliases)
reg(CssModules)
reg(ReactComponent)

module.exports = {entities}