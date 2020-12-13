const WebSocket = require('ws')

/**
 * local message sender
 * @param {string} id
 * @param {any} data
 * @private
 */
let _sendMessage = (id, data) => {}

/**
 * Send message to client
 * @param {'commonInfo' | 'createEntityMsg' | 'scriptsDict' | 'statusMessage' | 'scriptFinished'} id
 * @param {any} data
 * @return {void}
 */
const wsSend = (id, data) => {
    _sendMessage(id, data)
}

/**
 * Client message handlers
 * @type {Map<string, Array<function(data: any):void>>}
 */
const msgHandlers = new Map()

/**
 * Set client message handler
 * @param {string} id
 * @param {function(data:any):void} handler
 * @return {void}
 */
const wsOn = (id, handler) => {
    const list = msgHandlers[id]
    if (!list) {
        msgHandlers[id] = [handler]
    } else {
        if (!list.find(item => item === handler)) {
            list.push(handler)
        }
    }
}

/**
 * @param {{wsPort:number}} config
 */
const wsServerStart = (config) => {
    const port = config.wsPort
    const wss = new WebSocket.Server({ port })
    wss.on('connection', (ws) => {
        console.log('WebSocket server connection')
        ws.on('message', (message) => {
            try {
                console.log('<==', message)
                const {id, data} = JSON.parse(message)
                const handlers = msgHandlers[id]
                if (handlers) {
                    handlers.forEach(fn => fn(data))
                }
            } catch (e) {
                console.error(e)
            }
        })
        _sendMessage = (id, data) => {
            console.log('==>', id, data)
            ws.send(JSON.stringify({id, data}))
        }
        const {CommonInfo} = require('./CommonInfo')
        CommonInfo.setGlobalStatus()
        CommonInfo.send()
    })
}

module.exports = { wsServerStart, wsSend, wsOn }