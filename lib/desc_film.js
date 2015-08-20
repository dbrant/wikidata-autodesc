'use strict';

var propertiesList = require('./wd_properties').properties;
var P = propertiesList.P;
var Q = propertiesList.Q;

function matchType ( ad, claims ) {
    return ( ad.hasPQ( claims , P.instance_of, Q.film)
    || ad.hasPQ( claims , P.instance_of, Q.television_program)
    || ad.hasPQ( claims , P.instance_of, Q.television_series)
    || ad.hasPQ( claims , P.instance_of, Q.television_film));
}

function describe ( ad, claims, opt, callback ) {
    ad.logd("Describing film...");
    var load_items = [] ;
    ad.addItemsFromClaims ( claims , [ P.instance_of, P.publication_date, P.director, P.producer, P.genre,
        P.country_of_origin, P.country, P.nationality, P.cast_member ] , load_items );

    ad.labelItems ( load_items , function () {
        var h = [];
        var h2;

        var pubdate = ad.getYear ( claims , P.publication_date , opt.lang ) ;
        if ( pubdate != '' ) h.push ( pubdate ) ;

        h2 = ad.getCountryOfOrigin(claims, opt);
        if ( h2 != '' ) h.push ( h2 ) ;

        if (ad.hasP(claims, P.genre) && ad.hasPQ( claims , P.instance_of, Q.film)) {
            ad.add2desc ( h , claims , [ P.genre ] , { o:opt, max_count:1 } ) ;
        } else {
            ad.add2desc ( h , claims , [ P.instance_of ] , { o:opt, max_count:1 } ) ;
        }

        ad.add2desc ( h , claims , [ P.director ] , { txt_key:'directed by', o:opt } ) ;
        ad.add2desc ( h , claims , [ P.cast_member ] , { prefix:',', txt_key:'starring', o:opt, max_count:2 } ) ;

        // Fallback
        if ( h.length == 0 ) h.push ( ad.getStockString('film', opt.lang) ) ;
        callback( h.join(' ') );
    }, opt ) ;
}

exports.matchType = matchType;
exports.describe = describe;
