'use strict';

var propertiesList = require('./wd_properties').properties;
var P = propertiesList.P;
var Q = propertiesList.Q;

function matchType ( ad, claims ) {
    return ( ad.hasPQ( claims , P.instance_of, Q.human) );
}

function describe ( ad, claims, opt, callback ) {
    ad.logd("Describing person...");
    var load_items = [] ;
    ad.addItemsFromClaims ( claims , [ P.occupation, P.position_held, P.nationality, P.country_of_origin, P.award_received, P.instance_of, P.father, P.mother, P.spouse, P.member_of ] , load_items );

    var is_male = ad.hasPQ ( claims , P.sex , Q.male ) ;
    var is_female = ad.hasPQ ( claims , P.sex , Q.female ) ;

    ad.labelItems ( load_items , function () {
        var h = [] ;

        // Nationality
        var h2 = ad.getNationality(claims, opt);
        if ( h2 != '' ) h.push ( h2 ) ;

        // Occupation
        var ol = h.length ;
        ad.add2desc ( h , claims , [ P.occupation ] , { hints:{is_male:is_male,is_female:is_female,occupation:true}, o:opt, max_count:3 } ) ;
        if ( h.length == ol ) h.push ( ad.getStockString('person', opt.lang) ) ;

        // Dates
        var born = ad.getYear ( claims , P.date_of_birth , opt.lang ) ;
        var died = ad.getYear ( claims , P.date_of_death , opt.lang ) ;
        if ( born != '' && died != '' ) {
            h.push ( ' (' + born + '–' + died + ')' ) ;
        } else if ( born != '' ) {
            h.push ( ' (' + born + '–)' ) ;
        } else if ( died != '' ) {
            h.push ( ' (†' + died + ')' ) ;
        }

        // Office
        ad.add2desc ( h , claims , [ P.position_held ] , { hints:{is_male:is_male,is_female:is_female,office:true}, prefix:',', o:opt, max_count:4 } ) ;

        //if ( ad.hasPQ ( claims , P.sex , Q.female ) ) h.push ( '♀' ) ; // Female
        //if ( ad.hasPQ ( claims , P.sex , Q.male ) ) h.push ( '♂' ) ; // Male

        ad.add2desc ( h , claims , [ P.member_of ] , { prefix:';', txt_key:'member of', o:opt } ) ;
        //ad.add2desc ( h , claims , [ P.father, P.mother ] , { prefix:';', txt_key:'child of', o:opt } ) ;
        //ad.add2desc ( h , claims , [ P.spouse ] , { prefix:';', txt_key:'spouse of', o:opt } ) ;

        if ( h.length == 0 ) h.push ( ad.getStockString('person', opt.lang) ) ;
        callback( h.join(' ') );
    } , opt ) ;

}

exports.matchType = matchType;
exports.describe = describe;
