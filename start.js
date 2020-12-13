/**
 * Entry point of fe-gui application
 */
const fs = require('fs')
const {execSync} = require('child_process')

// Check minimum v10.0.0
const {node: nodeVer} = process.versions
const verArr = nodeVer.split('.')
if (+verArr[0] < 10) {
    console.error(`Invalid version of Node ${nodeVer}. The minimum acceptable version is 10.0.0.`)
    process.exit(1)
}

if (!fs.existsSync('./node_modules')) {
    console.log('Installing...')
    execSync('npm i')
}

const {mainServer} = require('./server/mainServer')
mainServer()