const path = require('path')
const fs = require('fs')
const {exec} = require('child_process')
const {htmlServer} = require('./htmlServer')
const {wsServerStart} = require('./wsServer')
const {wsHandlers} = require('./wsHandlers')
const {startAnalyse} = require('./startAnalyse')

const mainServer = () => {
    // load config
    const config = JSON.parse(
        fs.readFileSync(
            path.normalize(path.join(__dirname, '..', 'config.json')),
            {encoding: 'utf-8'}).toString()
    )
    const {httpPort} = config

    wsServerStart(config)
    wsHandlers()

    startAnalyse()

    const server = htmlServer(config)
    server.listen(httpPort, () => {
        console.log(`Server started:  http://localhost:${httpPort}`)
        exec(`start http://localhost:${httpPort}`)
    })
}

module.exports = {mainServer}