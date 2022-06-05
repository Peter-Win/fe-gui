function startMainScreen() {
    var localAddress;
    function enableLocalAddress(bOn) {
        if (localAddress) Rn.enable('#open-app-wnd', bOn);
    }
    function makeData(name) {
        return name.replace(/:/g, '-colon-');
    }
    function loadScripts() {
        var $scriptsList = $('#scripts-list');
        $scriptsList.text('Wait...');
        wsOff('scriptsDict');
        wsOn('scriptsDict', function (data) {
            $scriptsList.empty();
            if (data.scripts) {
                Object.keys(data.scripts).forEach(function (cmd) {
                    var $item = $('<div/>').appendTo($scriptsList);
                    var $btn = $('<button/>').text(cmd).appendTo($item).on('click', function (){
                        Rn.enable($btn, false);
                        wsSend('startScript', cmd);
                        if (cmd=='start') enableLocalAddress(true);
                    }).attr({title: data.scripts[cmd], 'data-cmd': makeData(cmd)});
                });
            }
        });
        wsSend('askScripts');
        wsOff('scriptFinished');
        wsOn('scriptFinished', function (name){
            Rn.enable($('[data-cmd='+makeData(name)+']',$scriptsList));
            if (name=='start') enableLocalAddress(false);
        });
    }
    function showTech(data) {
        var fr = $('#app-tech-info').empty();
        
        var key, value, tech = data.tech || {}, techVer = data.techVer || {};
        for (key in tech) {
            value = tech[key]
            if (value && typeof value === 'string') {
                var techName = tech[key];
                if (techVer[key]) techName += ' v'+techVer[key];
                $('<li>').text(key+': '+techName).appendTo(fr);
            } else if (value && /^style/.test(key)) {
                $('<li>').text(key.slice(5).toUpperCase()+' styling');
            }
        }
    }

    loadScripts();
    wsOn('commonInfo', function (data) {
        if (data) showTech(data)
    })
    showTech(g_commonInfo);
    function drawAddons(list) {
        var $list = $('#addons-list').empty();
        list.forEach(function (rec) {
            $('<button>').appendTo($list).text(rec.name).click(function (){
                $('button', $list).each(function (){ Rn.enable(this, false)})
                wsSend('startUpgrade', rec.name)
            });
        })
    }
    wsOn('readyEntities', drawAddons);
    wsSend('readyEntitiesAsk')
    try {
        localAddress = g_commonInfo.props.WebPack.localAddress;
        if (localAddress) {
            var $openApp = $('#open-app-wnd').attr({href: localAddress, target:'_blank'});
        }
    } catch(e){}
}

//////////////////////////////////
// Установка пакетов

var packagesCache = {}
Rn.F.AddPackage = function () {
    this.superClass = 'Base';
    this.curName = '';
    this.curPackage = null;
    this.curList = [];

    this.onInit = function () {
        var form = this;
        form.ctrls.dev.show(0);
        form.ctrls.types.show(0);
        wsOn('searchPackagesListResponse', function (data){
            if (!data.error) {
                var packages = packagesCache[data.name] = data.packages;
                if (data.name == form.curName) {
                    form.drawList(packages);
                }
            }
        })
    }
    this.install = function () {
        var data = this.save(0,1);
        var list = [data]
        if (data.types) {
            list.push({packageName: '@types/'+data.packageName, dev: true})
        }
        this.curName = '';
        this.curPackage = null;
        this.ctrls.packageName.setValue('')
        this.drawList([]);
        wsSend('installPackages', list);
    }
    this.drawCurPackage = function () {
        var form = this;
        var curPackage = this.curPackage;
        var $box = $('#found-packages').empty();
        var name = curPackage.name;
        this.curName = name;
        form.ctrls.packageName.setValue(name);
        form.ctrls.dev.show(1);
        var ctrlTypes = form.ctrls.types;
        var visTypes = false;
        if (g_commonInfo.tech.language === "TypeScript") {
            var trec = form.curList.find(function (rec){
                return rec.name === '@types/'+name;
            });
            if (trec) {
                visTypes = true;
                $('label', ctrlTypes.$def).attr({title: trec.description});
            }
        }
        ctrlTypes.show(visTypes);
        $('<hr>').appendTo($box);
        $('<div>').addClass('page-version').appendTo($box).text('Version: '+curPackage.version);
        var desc = curPackage.description;
        var $pdescr = $('<div>').addClass('package-description').appendTo($box).text(desc);
        if (/^<img(\s+[-a-z\d]+=".*")*\s*\/>$/i.test(desc)) {
            $pdescr.html(desc);
            $('img', $pdescr).css('max-width', '100%');
        }

        var linkBox = $('<div>').appendTo($box);
        Object.keys(curPackage.links || {}).forEach(function (key, i){
            if (i===0) linkBox.append('<span>Links:</span>')
            var d = $('<span>').appendTo(linkBox).addClass('package-link-box');
            $('<a>').appendTo(d).attr({href:curPackage.links[key], target:'_blank'}).text(key);
        });

        $('<button>').addClass('rn-submit').appendTo($box).text('Install').click(function(){
            form.install();
        });
    }
    this.drawList = function (list) {
        $('#package-wait').hide();
        var form = this;
        form.curList = list;
        form.ctrls.dev.show(0);
        form.ctrls.types.show(0);
        var $box = $('#found-packages').empty();
        list.forEach(function (rec){
            var $div = $('<div>').appendTo($box);
            var $a = $('<a>').addClass('package-item').appendTo($div).attr({href:'#'+rec.name}).text(rec.name);
            $a.click(function (e){
                e.preventDefault();
                form.curPackage = rec;
                form.drawCurPackage();
            })
        });
    }
    this.onPostUpdate = function () {
        var name = this.ctrls.packageName.getValue();
        if (name != this.curName) {
            this.curName = name;
            if (name.length > 1) {
                var list = packagesCache[name];
                if (list) {
                    this.drawList(list);
                } else {
                    wsSend('searchPackagesList', name);
                    $('#package-wait').show();
                }
            } else {
                this.curName = '';
                this.drawList([]);
            }
        }
    }
}
