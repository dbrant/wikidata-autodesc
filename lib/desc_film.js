'use strict';

var propertiesList = require('./wd_properties').properties;
var P = propertiesList.P;
var Q = propertiesList.Q;

function matchType ( ad, claims ) {
    return ( ad.hasPQ( claims , P.instance_of, Q.film) || ad.hasPQ( claims , P.instance_of, Q.television_program) || ad.hasPQ( claims , P.instance_of, Q.television_series) );
}

function describe ( ad, q, claims, opt, callback ) {
    var load_items = [] ;
    ad.addItemsFromClaims ( claims , P.instance_of , load_items );
    ad.addItemsFromClaims ( claims , P.publication_date , load_items );
    ad.addItemsFromClaims ( claims , P.director , load_items );
    ad.addItemsFromClaims ( claims , P.producer , load_items );
    ad.addItemsFromClaims ( claims , P.genre , load_items );
    ad.addItemsFromClaims ( claims , P.country_of_origin , load_items );
    ad.addItemsFromClaims ( claims , P.cast_member , load_items );

    ad.labelItems ( load_items , function ( item_labels ) {
        var h = [];
        var h2;

        var pubdate = ad.getYear ( claims , P.publication_date , opt.lang ) ;
        if ( pubdate != '' ) h.push ( pubdate ) ;

        h2 = ad.getCountryOfOrigin(item_labels, claims, opt);
        if ( h2 != '' ) h.push ( h2 ) ;

        if (ad.hasP(claims, P.genre) && ad.hasPQ( claims , P.instance_of, Q.film)) {
            ad.add2desc ( h , item_labels , [ P.genre ] , { o:opt, max_count:1 } ) ;
        } else {
            ad.add2desc ( h , item_labels , [ P.instance_of ] , { o:opt, max_count:1 } ) ;
        }

        ad.add2desc ( h , item_labels , [ P.director ] , { txt_key:'directed by', o:opt } ) ;
        ad.add2desc ( h , item_labels , [ P.cast_member ] , { prefix:',', txt_key:'starring', o:opt, max_count:2 } ) ;

        // Fallback
        if ( h.length == 0 ) h.push ( ad.getStockString('film', opt.lang) ) ;
        callback( h.join(' ') );
    }, opt ) ;
}

exports.matchType = matchType;
exports.describe = describe;
