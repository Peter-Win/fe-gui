const path = require('path')
const fs = require('fs')

const mimeTypes = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    jpg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    ico: 'image/png', // Подразумевается, что иконка является png
}

/**
 * Main part of server
 * Все запросы GET. Использубтся для отрисовки HTML.
 * Запрашиваемые ресурсы извлекаются из папки client.
 * Не используется REST. Для клиент-серверного взаимодействия используется WebSocket.
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
const main = async (request, response) => {
    if (request.method.toLowerCase() !== 'get') {
        response.writeHead(405, 'Method Not Allowed', {'Content-Type': 'text/html; charset=utf-8;'})
        response.end()
        return
    }
    const url = request.url === '/' ? '/index.html' : request.url
    const ext = path.extname(url).slice(1).toLowerCase()
    const contentType = mimeTypes[ext] || 'text/plain'
    const headers = {
        'Content-Type': contentType,
        Charset: 'utf-8',
    }
    const fileName = path.normalize(path.join(__dirname,'..','client', url))
    let fileHandle
    try {
        fileHandle = await fs.promises.open(fileName, 'r')
        const data = await fileHandle.readFile({})
        response.writeHead(200, headers)
        response.write(data)
    } catch(e) {
        response.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8;'})
    } finally {
        if (fileHandle) {
            fileHandle.close()
        }
    }
    response.end()
}

module.exports = { main }