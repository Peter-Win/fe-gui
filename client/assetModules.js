Rn.F.Assets = function () {
    this.superClass = 'Upgrade';
    this.onInit = function () {
        function preset(form, id, record) {
            function setup() {
                var rules = form.ctrls.rules;
                var data = rules.save()
                var emptyPos = -1, list = data.rules;
                for (var i=0; i<list.length; i++) {
                    if (list[i].extList === record.extList) return;
                    if (!list[i].extList) { emptyPos = i; break; }
                }
                if (emptyPos < 0) {
                    list.push(record)
                } else {
                    list[emptyPos] = record;
                }
                rules.load(data)
            }
            document.getElementById(id).addEventListener('click', setup)
        }
        preset(this, 'presetsRasters', { extList: 'png, jpg, jpeg, gif', type: 'resource', filename: 'images/[hash][ext][query]' });
        preset(this, 'presetsFonts', { extList: 'woff2, woff, ttf, otf', type: 'resource', filename: 'fonts/[hash][ext][query]' });
        preset(this, 'presetsSvg', { extList: 'svg', type: 'inline' })
    }
    this.onPostUpdate = function () {
        var form = this, ctrls = form.ctrls;
        // Search png and svg rules
        console.log('onPostUpdate');
        var i, ctrlRules = ctrls.rules, v, png=false, svg=false;
        for (i=0; i<ctrlRules.items.length; i++) {
            v = ctrlRules.items[i].ctrls.extList.getValue();
            png = png || /png/.test(v);
            svg = svg || /svg/.test(v);
        }
        console.log('png', png, 'svg', svg);
        ctrls.pngExample.enable(png);
        ctrls.svgExample.enable(svg);
        if (!png) ctrls.pngExample.setValue(false);
        if (!svg) ctrls.svgExample.setValue(false);
    }
}
