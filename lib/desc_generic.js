'use strict';

var propertiesList = require('./wd_properties').properties;
var P = propertiesList.P;
var Q = propertiesList.Q;

function matchType ( ad, claims ) {
    return true;
}

function describe ( ad, q, claims, opt, callback ) {
    var self = ad ;
    var load_items = [] ;

    self.addItemsFromClaims ( claims , 361 , load_items ) ; // Part of
    self.addItemsFromClaims ( claims , 279 , load_items ) ; // Subclass of
    self.addItemsFromClaims ( claims , 31 , load_items ) ; // Instance of
    self.addItemsFromClaims ( claims , 60 , load_items ) ; // Astronomical object

    self.addItemsFromClaims ( claims , 175 , load_items ) ; // Performer
    self.addItemsFromClaims ( claims , 86 , load_items ) ; // Composer
    self.addItemsFromClaims ( claims , 170 , load_items ) ; // Creator
    self.addItemsFromClaims ( claims , 57 , load_items ) ; // Director
    self.addItemsFromClaims ( claims , 162 , load_items ) ; // Producer
    self.addItemsFromClaims ( claims , 50 , load_items ) ; // Author
    self.addItemsFromClaims ( claims , 61 , load_items ) ; // Discoverer/inventor

    self.addItemsFromClaims ( claims , 17 , load_items ) ; // Country
    self.addItemsFromClaims ( claims , 131 , load_items ) ; // Admin unit

    self.addItemsFromClaims ( claims , 495 , load_items ) ; // Country of origin
    self.addItemsFromClaims ( claims , 159 , load_items ) ; // Headquarters location

    self.addItemsFromClaims ( claims , 306 , load_items ) ; // OS
    self.addItemsFromClaims ( claims , 400 , load_items ) ; // Platform

    self.addItemsFromClaims ( claims , 123 , load_items ) ; // Publisher
    self.addItemsFromClaims ( claims , 264 , load_items ) ; // Record label

    self.addItemsFromClaims ( claims , 105 , load_items ) ; // Taxon rank
    self.addItemsFromClaims ( claims , 138 , load_items ) ; // Named after
    self.addItemsFromClaims ( claims , 171 , load_items ) ; // Parent taxon

    self.addItemsFromClaims ( claims , 425 , load_items ) ; // Field of this profession
    self.addItemsFromClaims ( claims , 59 , load_items ) ; // Constellation

    self.labelItems ( load_items , function ( item_labels ) {
        var h = [];
        var h2;

        // Date
        var pubdate = self.getYear ( claims , 577 , opt.lang ) ;
        if ( pubdate != '' ) h.push ( pubdate ) ;

        // Instance/subclass/etc
        self.add2desc ( h , item_labels , [ P.subclass_of,31,60,105 ] , { o:opt } ) ;

        // Location
        h2 = [] ;
        (item_labels[131]||[]).forEach( function ( v ) {
            h2.push ( v ) ;
        } );
        var sep = ' / ' ;
        var h3 = [] ;
        (item_labels[17]||[]).forEach( function ( v ) {
            h3.push ( v ) ;
        } );
        if ( h.length == 0 && ( h2.length > 0 || h3.length > 0 ) ) h.push ( self.getStockString('location', opt.lang) ) ;
        if ( h2.length > 0 && h3.length > 0 ) h.push ( self.getStockString('in', opt.lang) + ' ' + h2.join(sep) + ", " + h3.join(sep) ) ;
        else if ( h2.length > 0 ) h.push ( self.getStockString('in', opt.lang) + ' ' + h2.join(sep) ) ;
        else if ( h3.length > 0 ) h.push ( self.getStockString('in', opt.lang) + ' ' + h3.join(sep) ) ;

        // Creator etc.
        self.add2desc ( h , item_labels , [ 175,86,170,57,50,61 ] , { txt_key:'by',o:opt } ) ;
        self.add2desc ( h , item_labels , [ 162 ] , { prefix:',' , txt_key:'produced by',o:opt } ) ;
        self.add2desc ( h , item_labels , [ 306,400 ] , { txt_key:'for',o:opt } ) ;
        self.add2desc ( h , item_labels , [ 264,123 ] , { txt_key:'from',o:opt } ) ;
        self.add2desc ( h , item_labels , [ 361 ] , { prefix:',' , txt_key:'part of',o:opt } ) ;
        self.add2desc ( h , item_labels , [ 138 ] , { prefix:',' , txt_key:'named after',o:opt } ) ;
        self.add2desc ( h , item_labels , [ 425 ] , { prefix:',' , txt_key:'in the field of',o:opt } ) ;
        self.add2desc ( h , item_labels , [ 171 ] , { prefix:'' , txt_key:'of',o:opt } ) ;
        self.add2desc ( h , item_labels , [ 59 ] , { prefix:'' , txt_key:'in the constellation',o:opt } ) ;

        // Origin (group of humans, organizations...)
        h2 = [];
        (item_labels[159]||[]).forEach( function ( v ) {
            h2.push ( v ) ;
        } );
        h3 = [];
        (item_labels[495]||[]).forEach( function ( v ) {
            h3.push ( v ) ;
        } );
        if ( h2.length > 0 && h3.length > 0 ) h.push ( self.getStockString('from', opt.lang) + ' ' + h2.join(sep) + ", " + h3.join(sep) ) ;
        else if ( h2.length > 0 ) h.push ( self.getStockString('from', opt.lang) + ' ' + h2.join(sep) ) ;
        else if ( h3.length > 0 ) h.push ( self.getStockString('from', opt.lang) + ' ' + h3.join(sep) ) ;

        // Fallback
        if ( h.length == 0 ) {
            h = self.getStockString('cannot_describe', opt.lang);
        }
        callback( h.join( ' ' ) );
    } , opt ) ;
}

exports.matchType = matchType;
exports.describe = describe;
