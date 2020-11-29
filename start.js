/**
 * Entry point of fe-gui application
 */
const path = require('path')
const fs = require('fs')
const {execSync, exec} = require('child_process')
const {htmlServer} = require('./server/htmlServer')
const {wsServerStart} = require('./server/wsServer')
const {startAnalyse} = require('./server/startAnalyse')
// load config
const config = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'config.json'), {encoding: 'utf-8'}).toString()
)
const {httpPort} = config

if (!fs.existsSync('./node_modules')) {
    console.log('Installing...')
    execSync('npm i')
}

startAnalyse()

wsServerStart(config)

const server = htmlServer(config)
server.listen(httpPort, () => {
    console.log(`Server started:  http://localhost:${httpPort}`)
    exec(`start http://localhost:${httpPort}`)
})
