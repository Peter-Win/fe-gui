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
    console.log("[open] Connection established", e);
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
var g_commonInfo = {folderName: ''};
var $activePage;

var onStatus = {
    init: function () {
        var form = Rn.curPage().forms.init;
        form.ctrls.name.focus();
    },
    error: function () {
        Rn.enable($('.j-retry', $activePage).off().on('click', function(){
            Rn.enable(this, false);
            $('.j-info', $activePage).empty();
            wsSend('startAnalyse');
        }));
    },
};
function drawGlobalStatus(newStatus) {
    globalStatus = newStatus || globalStatus;
    var pg = document.getElementById('glbStatus_' + newStatus);
    if (!pg) {
        pg = $('#glbStatus_unknown');
        $('#unknown_status').text(newStatus);
    }
    if ($activePage) {
        $activePage.hide();
    }
    $activePage = $(pg);
    $activePage.show();
    var fn = onStatus[newStatus];
    fn && fn();
}

$(function (){
    Rn.p.bPageSwitch = false;
    Rn.init('main');
    wsOn('globalStatus', function (status) {
        drawGlobalStatus(status);
    });
    wsOn('commonInfo', function (data) {
        g_commonInfo = data;
    });
    wsOn('errorAsJson', function(error) {
       Rn.tm('TmPre', {text: JSON.stringify(error, null, '  ')}, $('#glbStatus_error .j-info'));
    });
    drawGlobalStatus();
});

function FormInit() {
    this.superClass = 'Base';
    this.drawCommonInfo = function (info) {
        $('#glbStatus_init .j-folder-name').text(info.folderName);
        var ctrlName = this.ctrls.name;
        if (!ctrlName.getValue()) {
            ctrlName.setValue(info.folderName);
        }
    }
    this.onInit = function () {
        var form = this;
        form.drawCommonInfo(g_commonInfo);
        wsOn('commonInfo', function (info) {
            form.drawCommonInfo(info);
        });
    }
    this.onUpdate = function () {
        var form = this;
        var ctrlName = form.ctrls.name;
        var name = ctrlName.getValue();
        if (/[A-Z]/.test(name)) {
            // New packages must not have uppercase letters in the name.
            ctrlName.setValue(name.toLowerCase());
        }
        var ctrlTrans = form.ctrls.transpiler;
        var transpiler = ctrlTrans.val();
        var language = form.ctrls.language.val();
        var recTransTS = g_transpiler.find(function (item) {
            return item.value === 'TypeScript';
        });
        var isTransTS = recTransTS.disabled;
        recTransTS.disabled = language != 'TypeScript';
        if (isTransTS !== recTransTS.disabled) {
            ctrlTrans.buildList();
        }
        if (transpiler == 'TypeScript' && recTransTS.disabled) {
            ctrlTrans.setValue('Babel');
        }
    }
    this.onPostUpdate = function (){
        var form = this;
        Object.keys(form.ctrls).forEach(function (key){
           var ctrl = form.ctrls[key];
           ctrl.onPostUpdate && ctrl.onPostUpdate();
        });
    }
}
