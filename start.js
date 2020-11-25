/**
 * Entry point of fe-gui application
 */
const path = require('path')
const fs = require('fs')
const http = require('http')
const { execSync, spawn } = require('child_process')
const { main } = require('./server/main')

if (!fs.existsSync('./node_modules')) {
    console.log('Installing...')
    execSync('npm i')
}

const port = 5000

const server = new http.Server(main)
server.listen(port)
console.log(`Server started:  http://localhost:${port}`)