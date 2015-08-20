'use strict';

var propertiesList = require('./wd_properties').properties;
var P = propertiesList.P;
var Q = propertiesList.Q;

function matchType ( ad, claims ) {
    return ( ad.hasPQ( claims , P.instance_of, Q.chemical_element) );
}

function describe ( ad, claims, opt, callback ) {
    ad.logd("Describing element...");
    var load_items = [] ;
    ad.addItemsFromClaims ( claims , [ P.instance_of ], load_items );

    ad.labelItems ( load_items , function () {
        var h = [];
        var values;

        ad.add2desc ( h , claims , [ P.instance_of ] , { o:opt, max_count:1 } ) ;

        if (ad.hasP(claims, P.element_symbol)) {
            values = ad.getPValues(claims, P.element_symbol);
            if (values.length > 0) {
                h.push ( '(' + ad.getStockString(values[0], opt.lang) + ")" ) ;
            }
        }

        if (ad.hasP(claims, P.atomic_number)) {
            values = ad.getPValues(claims, P.atomic_number);
            if (values.length > 0) {
                h.push ( ad.getStockString('with', opt.lang) ) ;
                h.push ( ad.getStockString('atomic number', opt.lang) ) ;
                h.push ( ad.getStockString(values[0], opt.lang) ) ;
            }
        }

        // Fallback
        if ( h.length == 0 ) h.push ( ad.getStockString('element', opt.lang) ) ;
        callback( h.join(' ') );
    }, opt ) ;
}

exports.matchType = matchType;
exports.describe = describe;
