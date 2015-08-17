'use strict';

var propertiesList = require('./wd_properties').properties;
var P = propertiesList.P;
var Q = propertiesList.Q;

function matchType ( ad, claims ) {
    return ( ad.hasPQ( claims , P.instance_of, Q.taxon) );
}

function describe ( ad, claims, opt, callback ) {
    ad.logd("Describing taxon...");
    var load_items = [] ;
    ad.addItemsFromClaims ( claims , [ P.taxon_rank, P.parent_taxon, P.instance_of, P.subclass_of ] , load_items );

    ad.labelItems ( load_items , function () {
        var h = [] ;
        var h2;

        // Instance/subclass/etc
        ad.add2desc ( h , claims , [ P.subclass_of, P.taxon_rank ] , { o:opt } ) ;
        ad.add2desc ( h , claims , [ P.parent_taxon ] , { prefix:'', txt_key:'of', o:opt } ) ;

        if ( h.length == 0 ) h.push ( ad.getStockString('species', opt.lang) ) ;
        callback( h.join(' ') );
    }, opt );
}

exports.matchType = matchType;
exports.describe = describe;
