Array.prototype.forEach = Array.prototype.forEach || function (callback) {
    var list=this, i=0, n=list.length;
    for (; i<n; i++) {
        callback(list[i], i, list);
    }
}