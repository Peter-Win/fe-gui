const {CommonInfo} = require('./CommonInfo')
const startAnalyse = () => {
    CommonInfo.setGlobalStatus('load')
}
module.exports = { startAnalyse }