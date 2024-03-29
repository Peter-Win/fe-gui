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
function wsOff(msgId) {
    delete wsMsgDict[msgId];
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
var g_commonInfo = {common:{folderName: ''}};
var $activePage;

var onStatus = {
    init: function () {
        var form = Rn.curPage().forms.init;
        form.ctrlName().focus();
    },
    load: function() {
    },
    ready: startMainScreen,
    error: function () {
        Rn.enable($('.j-retry', $activePage).off().on('click', function(){
            Rn.enable(this, false);
            $('.j-info', $activePage).empty();
            wsSend('startAnalyse');
        }));
    },
    upgrade: function () {
        wsSend('upgradePromptAsk');
    },
    create: function () {
        $('.page-content', $activePage).empty();
    }
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

function msgKey(name) {
    return name.replace(/\+/g, '_');
}

function onCreateAppMsg(data) {
    var selector = data.name ? '[data-name='+msgKey(data.name)+'] .j-msg-content' : '.page-content';
    data.message.split('\n').forEach(function (s) {
        Rn.tm('TmCreateEntityMsg', {text: s, type: data.type}, $(selector, $activePage))
    })
}
function onCreateEnd() {
    var $div = $('<div>').css({marginTop: '1em'}).appendTo($('.page-content', $activePage));
    $('<button>').text('Continue').addClass('rn-submit').appendTo($div).click(function () {
        wsSend('setReady')
    });
}
function onStatusMessage(data) {
    var type = data.type || 'info';
    var $msg = $('<div/>').text(data.text).addClass('status-msg-'+type);
    $('.page-content', $activePage).append($msg);
}

$(function (){
    Rn.p.bPageSwitch = false;
    Rn.init('main');
    drawGlobalStatus();
    wsOn('globalStatus', function (status) {
        drawGlobalStatus(status);
    });
    wsOn('commonInfo', function (data) {
        g_commonInfo = data;
    });
    wsOn('errorAsJson', function(error) {
       Rn.tm('TmPre', {text: JSON.stringify(error, null, '  ')}, $('#glbStatus_error .j-info'));
    });
    wsOn('createEntityBegin', function (name){
        console.log('createEntityBegin', name)
        Rn.tm('TmCreateEntityBegin', {name: name, key: msgKey(name)}, $('.page-content', $activePage))
    });
    wsOn('createEntityEnd', function (data) {
        var st = $('[data-name='+msgKey(data.name)+'] .j-status', $activePage).text(data.status);
        if (data.status == 'Error') st.css({color:'red'})
        if (data.message) {
            if (data.status == 'Error') data.type = 'err';
            onCreateAppMsg(data);
        }
    });
    wsOn('createEntityMsg', function (data){
        onCreateAppMsg(data);
    })
    wsOn('statusMessage', function (data){
        console.log('statusMessage', data)
        onStatusMessage(data);
    })
    wsOn('upgradePrompt', onUpgradePrompt);
    wsOn('onCreateEnd', onCreateEnd);
});

function FormInit() {
    this.superClass = 'Base';
    this.onSubmit = function () {
        Rn.enable(this.$submit, false);
        var data = this.save(0, 1);
        console.log(data);
        wsSend('createApp', data);
    }
    this.ctrlName = function () {
        return this.ctrls.common.ctrls.name;
    }
    this.drawCommonInfo = function (info) {
        var folderName = info.common.folderName;
        $('#glbStatus_init .j-folder-name').text(folderName);
        var ctrlName = this.ctrlName();
        if (!ctrlName.getValue()) {
            ctrlName.setValue(folderName);
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
        function findRec(list, value) {
            return list.find(function (item){
                return item.value === value;
            })
        }
        var form = this;
        var ctrlName = form.ctrlName();
        var name = ctrlName.getValue();
        if (/[A-Z]/.test(name)) {
            // New packages must not have uppercase letters in the name.
            ctrlName.setValue(name.toLowerCase());
        }
        var techCtrls = form.ctrls.tech.ctrls;
        var ctrlTrans = techCtrls.transpiler;
        var ctrlFramework = techCtrls.framework;
        var transpiler = ctrlTrans.val();
        var language = techCtrls.language.val();
        var recTransTS = findRec(g_transpiler, 'TypeScript');
        var recTransNone = findRec(g_transpiler, 'None');
        var isTransTS = recTransTS.disabled, isTransNone = recTransNone.disabled;
        recTransTS.disabled = language != 'TypeScript';
        recTransNone.disabled = language != 'JavaScript';
        if (isTransTS !== recTransTS.disabled || isTransNone !== recTransNone.disabled) {
            ctrlTrans.buildList();
        }
        if (transpiler == 'TypeScript' && recTransTS.disabled) {
            ctrlTrans.setValue('Babel');
        } else if (transpiler == 'None' && recTransNone.disabled) {
            ctrlTrans.setValue('Babel');
        }
        var recReact = findRec(g_framework, 'React');
        var disabledReact = !!recReact.disabled;
        recReact.disabled = transpiler === 'None'
        if (recReact.disabled) {
            ctrlFramework.setValue('None');
        }
        if (disabledReact !== recReact.disabled) {
            ctrlFramework.buildList();
        }
    }
    this.onPostUpdate = function (){
        this.walk({
            ctrlBegin: function (ctrl) {
                ctrl.onPostUpdate && ctrl.onPostUpdate();
            },
        });
    }
}

/**
 * Подготовить экран для добавления новой сущности к приложению
 * @param {{name:string, html:string, params:Object}} data
 */
function onUpgradePrompt(data) {
    $('#AddonName').text(data.name);
    var $box = $('#AddonForm').html(data.html);
    Rn.initForms(Rn.curPage(), $box);
    Rn.curPage().forms.upgrade.load(data.params, 1)
    $('.j-cancel-upgrade', $box).click(function (){
        wsSend('upgradeCancel');
    });
}

Rn.F.Upgrade = function () {
    this.superClass = 'Base';
    this.onSubmit = function () {
        var data = {name: g_commonInfo.upgradeTarget, params: {}};
        this.save(data.params, 1)
        wsSend('upgradeEntity', data);
    }
}

Rn.V.ScriptName = function () {
    this.superClass = 'Base'
    this.check = function (value) {
        var user = this.ctrl.owner.ctrls[this.use]
        if (user && !user.getValue()) {
            return '';
        }
        if (!value) return 'Empty field'
        if (!/^[-_a-z\d:]+$/i.test(value)) return 'Invalid name'
    }
}