// Урл для связи с сервером через WebSocket извлекается из куки
var res = /wsurl=([a-z\d:/]*)(;|$)/.exec(document.cookie);
if (!res) {
    throw new Error('Not found ws url in cookies');
}
var wsurl = res[1];
var socket = new WebSocket(wsurl);

var wsMsgDict = {};

/**
 * Subscibe to server message
 * @param {string} msgId
 * @param {function(data:any):void} handler
 */
function wsOn(msgId, handler) {
    var list = wsMsgDict[msgId];
    if (list) {
        list.push(handler);
    } else {
        wsMsgDict[msgId] = [handler];
    }
}

function wsSend(msgId, data) {
    socket.send(JSON.stringify({id: msgId, data: data}));
}

socket.onopen = function(e) {
    console.log("[open] Соединение установлено", e);
    wsSend('hi', 'Hello, World A!');
};

socket.onmessage = function(event) {
    // Все сообщения имеют одинаковый формат {id:string, data: any}
    var msg = JSON.parse(event.data);
    console.log('[message]', msg);
    (wsMsgDict[msg.id] || []).forEach(function (fn) {
        fn(msg.data);
    });
};

var globalStatus = '';
function drawGlobalStatus($root, newStatus) {
    globalStatus = newStatus || globalStatus;
    var tmId = 'TmGlbState_' + newStatus;
    if (Rn.hasTm(tmId)) {
        Rn.tm(tmId, null, $root);
    }
}

$(function (){
    var $root = $('#root');
    wsOn('globalStatus', function (status) {
        drawGlobalStatus($root, status);
    });
    drawGlobalStatus($root);
});