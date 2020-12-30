function startMainScreen() {
    var localAddress;
    function enableLocalAddress(bOn) {
        if (localAddress) Rn.enable('#open-app-wnd', bOn);
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
                    }).attr({title: data.scripts[cmd], 'data-cmd': cmd});
                });
            }
        });
        wsSend('askScripts');
        wsOff('scriptFinished');
        wsOn('scriptFinished', function (name){
            Rn.enable($('[data-cmd='+name+']',$scriptsList));
            if (name=='start') enableLocalAddress(false);
        });
    }
    function showTech(data) {
        var fr = $('#app-tech-info').empty();
        var key, value, tech = data.tech || {};
        for (key in tech) {
            value = tech[key]
            if (value && typeof value === 'string') {
                $('<li>').text(key+': '+tech[key]).appendTo(fr);
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
    try {
        localAddress = g_commonInfo.props.WebPack.localAddress;
        if (localAddress) {
            var $openApp = $('#open-app-wnd').attr({href: localAddress, target:'_blank'});
        }
    } catch(e){}
}
