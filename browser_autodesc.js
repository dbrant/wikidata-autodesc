'use strict';

var autodesc = require('./lib/autodesc');

window.getWikidataDescription = function(title, callback) {
    var params = {
        lang: "en"
    };
    autodesc.ad.getDescription ( title , params , function ( qnum, text ) {
        var label = "";
        var manual_desc = "";
        if (undefined !== autodesc.wd.items[qnum]) {
            label = autodesc.wd.items[qnum].getLabel(params.lang);
            manual_desc = autodesc.wd.items[qnum].getDesc(params.lang);
        }
        callback(qnum, label, manual_desc, text);
    });
};
