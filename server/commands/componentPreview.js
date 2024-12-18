const { makeCreateReactComponentParams } = require('../entity/ReactComponent/ReactComponent')
const { createReactComponent } = require('../entity/ReactComponent/ReactComponent.utils')
const { mainFrameUpdate } = require('../entity/ReactComponent/mainFrameUpdate')
const { wsSend } = require('../wsServer')
const { readRows } = require('../sysUtils/textFile')
const { makeSrcName } = require('../fileUtils')
const { CommonInfo } = require('../CommonInfo')
const { injectDemoCodeToMainFrame } = require('../sysUtils/injectDemoCode')

const componentPreview = async (params) => {
    const res = createReactComponent(await makeCreateReactComponentParams(params))
    if (params.useMainFrame) {
        const name = `MainFrame.${CommonInfo.getExtension('render')}`
        const rows = await readRows(makeSrcName(name))
        injectDemoCodeToMainFrame(rows, mainFrameUpdate({...params, ...res}))
        res.files.push({ name, data: rows.join('\n') })
    }
    wsSend('componentPreview', res)
}

module.exports = {componentPreview}