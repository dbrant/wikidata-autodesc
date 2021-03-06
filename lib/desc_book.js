'use strict';

var propertiesList = require('./wd_properties').properties;
var P = propertiesList.P;
var Q = propertiesList.Q;

function matchType ( ad, claims ) {
    return ( ad.hasPQ( claims , P.instance_of, Q.book) || ad.hasPQ( claims , P.instance_of, Q.literary_work));
}

function describe ( ad, claims, opt, callback ) {
    ad.logd("Describing publication...");
    var load_items = [] ;
    ad.addItemsFromClaims ( claims , [ P.instance_of, P.publication_date, P.author, P.genre ], load_items );

    ad.labelItems ( load_items , function () {
        var h = [];

        var pubdate = ad.getYear ( claims , P.publication_date , opt.lang ) ;
        if ( pubdate != '' ) h.push ( pubdate ) ;

        if (ad.hasP(claims, P.genre)) {
            ad.add2desc ( h , claims , [ P.genre ] , { o:opt, max_count:1 } ) ;
        } else {
            ad.add2desc ( h , claims , [ P.instance_of ] , { o:opt, max_count:1 } ) ;
        }

        ad.add2desc ( h , claims , [ P.author ] , { txt_key:'by', o:opt } ) ;

        // Fallback
        if ( h.length == 0 ) h.push ( ad.getStockString('book', opt.lang) ) ;
        callback( h.join(' ') );
    }, opt ) ;
}

exports.matchType = matchType;
exports.describe = describe;
