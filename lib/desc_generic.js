'use strict';

var propertiesList = require('./wd_properties').properties;
var P = propertiesList.P;
var Q = propertiesList.Q;

function matchType ( ad, claims ) {
    return true;
}

function describe ( ad, claims, opt, callback ) {
    ad.logd("Describing generic item...");
    var load_items = [] ;
    ad.addItemsFromClaims ( claims , [ P.part_of, P.subclass_of, P.instance_of, P.performer, P.composer, P.creator,
        P.director, P.producer, P.author, P.discoverer_or_inventor, P.country,
        P.located_in_the_administrative_territorial_entity, P.country_of_origin, P.headquarters_location,
        P.operating_system, P.platform, P.publisher, P.record_label, P.taxon_rank, P.named_after, P.parent_taxon,
        P.field_of_this_profession, P.constellation ] , load_items ) ;

    ad.labelItems ( load_items , function () {
        var h = [];
        var h2;

        // Date
        var pubdate = ad.getYear ( claims , P.publication_date , opt.lang ) ;
        if ( pubdate != '' ) h.push ( pubdate ) ;

        // Instance/subclass/etc
        ad.add2desc ( h , claims , [ P.subclass_of, P.instance_of, P.taxon_rank ] , { o:opt } ) ;

        // Location
        h2 = [] ;
        ad.getP(P.located_in_the_administrative_territorial_entity).forEach( function ( v ) {
            h2.push ( v ) ;
        } );
        var sep = ' / ' ;
        var h3 = [] ;
        ad.getP(P.country).forEach( function ( v ) {
            h3.push ( v ) ;
        } );
        if ( h.length == 0 && ( h2.length > 0 || h3.length > 0 ) ) h.push ( ad.getStockString('location', opt.lang) ) ;
        if ( h2.length > 0 && h3.length > 0 ) h.push ( ad.getStockString('in', opt.lang) + ' ' + h2.join(sep) + ", " + h3.join(sep) ) ;
        else if ( h2.length > 0 ) h.push ( ad.getStockString('in', opt.lang) + ' ' + h2.join(sep) ) ;
        else if ( h3.length > 0 ) h.push ( ad.getStockString('in', opt.lang) + ' ' + h3.join(sep) ) ;

        // Creator etc.
        ad.add2desc ( h , claims , [ P.creator, P.composer, P.performer, P.director, P.author, P.discoverer_or_inventor ] , { txt_key:'by',o:opt } ) ;
        ad.add2desc ( h , claims , [ P.producer ] , { prefix:',' , txt_key:'produced by',o:opt } ) ;
        ad.add2desc ( h , claims , [ P.operating_system, P.platform ] , { txt_key:'for',o:opt } ) ;
        ad.add2desc ( h , claims , [ P.record_label, P.publisher ] , { txt_key:'from',o:opt } ) ;
        ad.add2desc ( h , claims , [ P.part_of ] , { prefix:',' , txt_key:'part of',o:opt } ) ;
        ad.add2desc ( h , claims , [ P.named_after ] , { prefix:',' , txt_key:'named after',o:opt } ) ;
        ad.add2desc ( h , claims , [ P.field_of_this_profession ] , { prefix:',' , txt_key:'in the field of',o:opt } ) ;
        ad.add2desc ( h , claims , [ P.parent_taxon ] , { prefix:'' , txt_key:'of',o:opt } ) ;
        ad.add2desc ( h , claims , [ P.constellation ] , { prefix:'' , txt_key:'in the constellation',o:opt } ) ;

        // Origin (group of humans, organizations...)
        h2 = [];
        ad.getP(P.headquarters_location).forEach( function ( v ) {
            h2.push ( v ) ;
        } );
        h3 = [];
        ad.getP(P.country_of_origin).forEach( function ( v ) {
            h3.push ( v ) ;
        } );
        if ( h2.length > 0 && h3.length > 0 ) h.push ( ad.getStockString('from', opt.lang) + ' ' + h2.join(sep) + ", " + h3.join(sep) ) ;
        else if ( h2.length > 0 ) h.push ( ad.getStockString('from', opt.lang) + ' ' + h2.join(sep) ) ;
        else if ( h3.length > 0 ) h.push ( ad.getStockString('from', opt.lang) + ' ' + h3.join(sep) ) ;

        // Fallback
        if ( h.length == 0 ) {
            h.push( ad.getStockString('cannot_describe', opt.lang) );
        }
        callback( h.join( ' ' ) );
    } , opt ) ;
}

exports.matchType = matchType;
exports.describe = describe;
