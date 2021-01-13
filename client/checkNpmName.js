// Контроллер проверки имени npm-пакета
var npmNameCache = {};

Rn.C.CheckNpmName = function () {
    this.status = '';
    this.superClass = 'Base';
    this.onInit = function () {
        var ctrl = this;
        wsOn('searchPackageResponse', function (response) {
            if (response.error) {
                npmNameCache[response.name] = 'error'; // Если сбросить, то пойдет бесконечный цикл запросов
            } else {
                npmNameCache[response.name] = response.package || 'free';
            }
            ctrl.updateStatus();
        });
    }
    this.getStatus = function () {
        var nameCtrl = this.owner.ctrls.name;
        var name = nameCtrl.getValue();
        if (!name || nameCtrl.lastErr) {
            return '';
        }
        var cached = npmNameCache[name];
        if (!cached) {
            npmNameCache[name] = 'wait';
            wsSend('searchPackage', name);
            return '';
        }
        if (cached === 'wait' || cached === 'error') {
            return '';
        }
        return cached === 'free' ? 'TmNpmNameFree' : 'TmNpmNameTaken';
    }
    this.onPostUpdate = function () {
        this.updateStatus()
    }
    this.updateStatus = function() {
        var isPrivate = this.owner.ctrls.private.getValue();
        this.show(!isPrivate);
        if (isPrivate) return;
        var status = this.getStatus();
        if (status !== this.status) {
            this.status = status;
            if (!status) {
                this.$def.empty();
            } else {
                Rn.tm(status, null, this.$def, 1);
            }
        }
    }
}