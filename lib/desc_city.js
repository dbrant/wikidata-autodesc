'use strict';

var propertiesList = require('./wd_properties').properties;
var P = propertiesList.P;
var Q = propertiesList.Q;

function matchType ( ad, claims ) {
    return ( ad.hasPQ( claims , P.instance_of, Q.city) || ad.hasPQ( claims , P.instance_of, Q.capital) );
}

function describe ( ad, claims, opt, callback ) {
    var load_items = [] ;
    ad.addItemsFromClaims ( claims , [ P.part_of, P.subclass_of, P.instance_of, P.country, P.located_in_the_administrative_territorial_entity, P.capital_of, P.named_after ] , load_items ) ;

    ad.labelItems ( load_items , function ( item_labels ) {
        var h = [];
        var h2;
        var countryCapital = false;

        if (ad.hasP(claims, P.capital_of)) {
            var countryArr = item_labels[P.country]||[];
            if (countryArr.length > 0) {
                var country = countryArr[0];
                (item_labels[P.capital_of] || []).forEach(function (v) {
                    if (country === v) {
                        ad.add2desc ( h , item_labels , [ P.capital_of ] , { txt_key:'capital of', o:opt, max_count:1 } ) ;
                        countryCapital = true;
                    }
                });
            }
        }

        if (!countryCapital) {
            // Instance/subclass/etc
            ad.add2desc(h, item_labels, [P.subclass_of, P.instance_of], { o: opt, max_count:1 });

            // Location
            h2 = [];
            (item_labels[P.located_in_the_administrative_territorial_entity] || []).forEach(function (v) {
                h2.push(v);
            });
            var sep = ' / ';
            var h3 = [];
            (item_labels[P.country] || []).forEach(function (v) {
                h3.push(v);
            });
            if (h.length == 0 && ( h2.length > 0 || h3.length > 0 )) h.push(ad.getStockString('location', opt.lang));
            if (h2.length > 0 && h3.length > 0) h.push(ad.getStockString('in', opt.lang) + ' ' + h2.join(sep) + ", " + h3.join(sep));
            else if (h2.length > 0) h.push(ad.getStockString('in', opt.lang) + ' ' + h2.join(sep));
            else if (h3.length > 0) h.push(ad.getStockString('in', opt.lang) + ' ' + h3.join(sep));

            ad.add2desc ( h , item_labels , [ P.capital_of ] , { prefix:',' , txt_key:'capital of', o:opt, max_count:1 } ) ;
        }

        ad.add2desc ( h , item_labels , [ P.part_of ] , { prefix:',' , txt_key:'part of',o:opt } ) ;
        ad.add2desc ( h , item_labels , [ P.named_after ] , { prefix:',' , txt_key:'named after',o:opt } ) ;

        // Fallback
        if ( h.length == 0 ) {
            h = ad.getStockString('cannot_describe', opt.lang);
        }
        callback( h.join( ' ' ) );
    } , opt ) ;
}

exports.matchType = matchType;
exports.describe = describe;
