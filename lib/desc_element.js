'use strict';

var propertiesList = require('./wd_properties').properties;
var P = propertiesList.P;
var Q = propertiesList.Q;

function matchType ( ad, claims ) {
    return ( ad.hasP( claims , P.atomic_number ) );
}

function describe ( ad, claims, opt, callback ) {
    ad.logd("Describing element...");
    var load_items = [] ;
    ad.addItemsFromClaims ( claims , [ P.instance_of, P.discoverer_or_inventor, P.named_after ], load_items );

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

        if (ad.hasP(claims, P.neutron_number)) {
            values = ad.getPValues(claims, P.neutron_number);
            if (values.length > 0) {
                h.push ( ',' ) ;
                h.push ( ad.getStockString('neutron number', opt.lang) ) ;
                h.push ( ad.getStockString(values[0], opt.lang) ) ;
            }
        }

        ad.add2desc ( h , claims , [ P.discoverer_or_inventor ] , { prefix:',' , txt_key:'discovered by',o:opt } ) ;
        ad.add2desc ( h , claims , [ P.named_after ] , { prefix:',' , txt_key:'named after',o:opt } ) ;

        // Fallback
        if ( h.length == 0 ) h.push ( ad.getStockString('element', opt.lang) ) ;
        callback( h.join(' ').replace(/ ,/g, ',') );
    }, opt ) ;
}

exports.matchType = matchType;
exports.describe = describe;
