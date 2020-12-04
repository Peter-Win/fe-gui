Array.prototype.forEach = Array.prototype.forEach || function (callback) {
    var list=this, i=0, n=list.length;
    for (; i<n; i++) {
        callback(list[i], i, list);
    }
};

Array.prototype.find = Array.prototype.find || function (callback) {
    var list=this, i=0, n=list.length;
    while (i<n) {
        if (callback(list[i], i, list)) {
            return list[i];
        }
    }
    return undefined;
};