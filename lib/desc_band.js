'use strict';

var propertiesList = require('./wd_properties').properties;
var P = propertiesList.P;
var Q = propertiesList.Q;

function matchType ( ad, claims ) {
    return ( ad.hasPQ( claims , P.instance_of, Q.band) || ad.hasPQ( claims , P.instance_of, Q.rock_band) );
}

function describe ( ad, claims, opt, callback ) {
    ad.logd("Describing band...");
    var load_items = [] ;
    ad.addItemsFromClaims ( claims , [ P.instance_of, P.genre, P.country_of_origin, P.country, P.nationality ] , load_items );

    ad.labelItems ( load_items , function () {
        var h = [];
        var h2;

        h2 = ad.getCountryOfOrigin(claims, opt);
        if ( h2 != '' ) h.push ( h2 ) ;

        if (ad.hasP(claims, P.genre)) {
            ad.add2desc ( h , claims , [ P.genre ] , { o:opt, max_count:1 } ) ;
        }

        ad.add2desc ( h , claims , [ P.instance_of ] , { o:opt, max_count:1 } ) ;

        // Fallback
        if ( h.length == 0 ) h.push ( ad.getStockString('film', opt.lang) ) ;
        callback( h.join(' ') );
    }, opt ) ;
}

exports.matchType = matchType;
exports.describe = describe;
