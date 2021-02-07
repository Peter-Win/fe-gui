Rn.F.Antd = function () {
    this.superClass = 'Upgrade';
    this.onInit = function () {
        this.load({
            createCode: true,
            useHeader: true,
            useSide: false,
            useFooter: true,
            menuPos: 'header',
            siderPos: 'outside',
            theme: '',
        });
    }
    this.onPostUpdate = function () {
        var form = this, ctrls = form.ctrls;
        var isUseHeader = ctrls.useHeader.getValue(), isUseSider = ctrls.useSider.getValue();
        var ctrlUseMenu = ctrls.useMenu, ctrlMenuPos = ctrls.menuPos;
        var isCanUseMenu = isUseHeader || isUseSider;
        var ctrlSiderPos = ctrls.siderPos;
        ctrlSiderPos.show(isUseSider);
        ctrlUseMenu.enable(isCanUseMenu);
        ctrlMenuPos.show(ctrlUseMenu.getValue() && isCanUseMenu);
        g_antMenuPos[0].disabled = !isUseHeader;
        g_antMenuPos[1].disabled = !isUseSider;
        if (ctrlMenuPos.isVisible()) {
            var menuPos = ctrlMenuPos.getValue();
            if (!isUseHeader && menuPos === 'header') ctrlMenuPos.setValue('sider');
            else if (!isUseSider && menuPos === 'sider') ctrlMenuPos.setValue('header');
            ctrlMenuPos.buildList();
        }
        this.drawPreview();
    }
    this.drawPreview = function () {
        var ctrls = this.ctrls;
        var theme = ctrls.theme.getValue();
        var isUseSider = ctrls.useSider.getValue();
        var siderPos = ctrls.siderPos.getValue();
        var menuPos = ctrls.menuPos.getValue();

        var siderText = 'Sider', headerText = 'Header';
        if (ctrls.useMenu.getValue()) {
            var menuText = '[Menu]';
            if (menuPos === 'sider') siderText = menuText;
            if (menuPos === 'header') headerText = menuText;
        }
        function themeCss(part) {
            return antThemes[theme==='dark' ? theme : 'default'][part];
        }

        var $preview = $('#Antd_preview').empty();
        $preview.css({display: 'flex', flexDirection: 'row'});
        if (isUseSider && siderPos === 'outside') {
            $('<div>').appendTo($preview).addClass('ant-preview-row-item')
                .css({flex: 1}).css(themeCss('sider')).text(siderText);
        }
        var $mainPart = $('<div>').appendTo($preview).css({flex: '4', display: 'flex', flexDirection: 'column'});
        if (ctrls.useHeader.getValue()) {
            $('<div>').appendTo($mainPart).addClass('ant-preview-row-item')
                .css({height: '20%'}).css(themeCss('header')).text(headerText);
        }
        var $center = $('<div>').appendTo($mainPart).addClass('ant-preview-row').css({flex: 1});
        if (isUseSider && siderPos === 'inside') {
            $('<div>').appendTo($center).addClass('ant-preview-row-item')
                .css({width: '20%'}).css(themeCss('sider')).text(siderText);
        }
        $('<div>').appendTo($center).addClass('ant-preview-row-item')
            .css({flex: 1}).css(themeCss('content')).text('Content');
        if (ctrls.useFooter.getValue()) {
            $('<div>').appendTo($mainPart).addClass('ant-preview-row-item')
                .css({height: '20%'}).css(themeCss('footer')).text('Footer');
        }
    }
}
var colTxt = 'rgba(0, 0, 0, 0.85)';
var antThemes = {
    default: {
        sider: {background: '#FFF', color: colTxt},
        header: {background: '#FFF', color: colTxt},
        content: {background: 'rgb(240, 242, 245)', color: colTxt},
        footer: {background: 'rgb(240, 242, 245)', color: colTxt},
    },
    dark: {
        sider: {background: '#141414', color: 'white'},
        header: {background: '#1f1f1f', color: 'white'},
        content: {background: '#000', color: '#FFF'},
        footer: {background: '#000', color: '#FFF'},
    },
}
