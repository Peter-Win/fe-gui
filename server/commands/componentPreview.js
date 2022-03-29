const {makeCreateReactComponentParams} = require('../entity/ReactComponent/ReactComponent')
const {createReactComponent} = require('../entity/ReactComponent/ReactComponent.utils')
const { wsSend } = require('../wsServer')

const componentPreview = async (params) => {
    const res = createReactComponent(makeCreateReactComponentParams(params))
    wsSend('componentPreview', res)
}

module.exports = {componentPreview}