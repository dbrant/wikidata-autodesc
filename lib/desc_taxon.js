'use strict';

var wd = require('./wikidata').wd ;
var propertiesList = require('./wd_properties').properties;
var P = propertiesList.P;
var Q = propertiesList.Q;

function matchType ( ad, claims ) {
    return ( ad.hasPQ( claims , P.instance_of, Q.taxon) );
}

// order matters
var taxonStrings = [
    [Q.hominidae, 'hominids'],
    [Q.felidae, 'felines'],
    [Q.marsupial, 'marsupials'],
    [Q.rodentia, 'rodents'],
    [Q.mammal, 'mammals'],
    [Q.bird, 'birds'],
    [Q.osteichthyes, 'fish'],
    [Q.chondrichthyes, 'fish'],
    [Q.dinosaur, 'dinosaurs'],
    [Q.reptile, 'reptiles'],
    [Q.mollusca, 'molluscs'],
    [Q.plant, 'plants'],
    [Q.fungus, 'fungus'],
    [Q.insect, 'insects'],
    [Q.animal, 'animals']
];

function getTaxonString( q ) {
    var ret = '';
    taxonStrings.forEach(function (v) {
        if (v[0] == q) {
            ret = v[1];
        }
    });
    return ret;
}

function describe ( ad, claims, opt, callback ) {
    ad.logd("Describing taxon...");
    var load_items = [] ;

    // query to get the phylum for a taxon:
    // "tree[Qxxx][171][] AND claim[105:38348]&callback=?"

    // query to get all parent taxa of the taxon:
    // TREE[Qxxx][171]

    //wd.getCustomLabsQuery( 'http://wdq.wmflabs.org/api?q=tree['+opt.q.replace(/\D/g,'') +']['
    //    + P.parent_taxon + '][]%20AND%20claim[' + P.taxon_rank + ':' + Q.phylum + ']&callback=?', function (response) {

    wd.getCustomLabsQuery( 'http://wdq.wmflabs.org/api?q=tree['+opt.q.replace(/\D/g,'') +'][' + P.parent_taxon + ']&callback=?', function (response) {

        if (response.items === undefined) {
            response.items = [];
        }
        if ( response.items.length > 0 ) {
            //ad.addEmptyClaim(claims, P.custom1, response.items.pop());
        }

        ad.addItemsFromClaims ( claims , [ P.taxon_rank, P.custom1, P.parent_taxon, P.instance_of, P.subclass_of ] , load_items );

        ad.labelItems ( load_items , function () {
            var h = [] ;
            var h2, i, j;
            var taxonItem = -1;

            for (i = 0; i < taxonStrings.length; i++) {
                for (j = 0; j < response.items.length; j++) {
                    if (taxonStrings[i][0] == response.items[j]) {
                        taxonItem = i;
                        break;
                    }
                }
                if (taxonItem > -1) {
                    break;
                }
            }

            if (taxonItem > -1) {
                var pArr = ad.getP(claims, P.taxon_rank);
                if (pArr.length > 0) {
                    var rank = pArr[0].qLabel;
                    h.push(rank);
                    h.push( ad.getStockString('of', opt.lang) );
                    h.push(taxonStrings[taxonItem][1]);

                    pArr = ad.getP(claims, P.parent_taxon);
                    if (pArr.length > 0){
                        h.push('(' + pArr[0].qLabel + ')');
                    }
                }
            }

            if (h.length == 0) {
                // Instance/subclass/etc
                ad.add2desc(h, claims, [P.subclass_of, P.taxon_rank], {o: opt});
                ad.add2desc(h, claims, [P.parent_taxon], {prefix: '', txt_key: 'of', o: opt});
            }

            if ( h.length == 0 ){
                h.push ( ad.getStockString('species', opt.lang) ) ;
            }

            callback( h.join(' ') );
        }, opt );
    });

}

exports.matchType = matchType;
exports.describe = describe;
