/**
 * Entry point of fe-gui application
 */
const fs = require('fs')
const {execSync} = require('child_process')

if (!fs.existsSync('./node_modules')) {
    console.log('Installing...')
    execSync('npm i')
}

const {mainServer} = require('./server/mainServer')
mainServer()