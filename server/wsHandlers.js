const {wsOn,wsSend} = require('./wsServer')
const {npmSearch} = require('./commands/npmSearch')

const wsHandlers = () => {
    wsOn('searchPackage', async (name) => {
        let err, package
        try {
            const list = await npmSearch(name)
            package = list.find(item => item.name === name)
        } catch(e) {
            err = e
        }
        wsSend('searchPackageResponse', {name, package, error: err && err.message})
    })
}

module.exports = {wsHandlers}