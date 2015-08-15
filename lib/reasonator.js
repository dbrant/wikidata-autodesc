'use strict';

var jsdom = require("jsdom");
var $ = require("jquery")(jsdom.jsdom().defaultView);
var wd = require('./wikidata.js').wd ;

// Fake reasonator object
var reasonator = {

    Q : {
        human : 5 ,
        male : 6581097 ,
        female : 6581072 ,
        person : 215627 ,
        geographical_feature : 618123 ,
        category_page : 4167836 ,
        template_page : 11266439 ,
        list_page : 13406463 ,
        disambiguation_page : 4167410
    } ,

    P : {
        father : 22 ,
        mother : 25 ,
        child : 40 ,
        brother : 7 ,
        sister : 9 ,
        spouse : 26 ,
        uncle : 29 ,
        aunt : 139 ,
        relative : 1038 ,
        stepfather : 43 ,
        stepmother : 44 ,
        grandparent : 45 ,
        nationality : 27 ,
        sex : 21 ,
        occupation : 106 ,
        signature : 109
    } ,

    personal_relation_list : [] ,

    wd : wd ,

    main_type_object : {
        relations : {
            parents : []
        }
    } ,

    init : function () {
        var self = this ;
        $.each ( ['father','mother','child','brother','sister','spouse','uncle','aunt','stepfather','stepmother','grandparent','relative'] , function ( k , v ) {
            self.personal_relation_list.push ( self.P[v] ) ;
        } ) ;
    } ,

    getSelfURL : function ( o ) {
        return undefined ; // Dummy
    } ,

    getFunctionName : function ( q ) {
        var me = this ;
        if ( typeof me.wd.items[q] == 'undefined' ) return ;
        if ( me.wd.items[q].hasClaimItemLink ( 31 , 5 ) ) return 'run_person' ;
        return ; // No suitable function
    } ,

    generateRelations : function ( q ) {
        var me = this ;
        var rel = {} ;
        rel[q] = {} ;
        $.each ( [me.wd.items[q]] , function ( dummy , item ) {
            var cq = item.getID() ;
            if ( item.hasClaimItemLink ( me.P.sex , me.Q.male ) ) item.gender = 'M' ;
            else if ( item.hasClaimItemLink ( me.P.sex , me.Q.female ) ) item.gender = 'F' ;
            else if ( item.hasClaimItemLink ( me.P.entity_type , me.Q.person ) ) item.gender = '?' ;

            $.each ( me.personal_relation_list , function ( dummy2 , p ) {
                var items = item.getClaimObjectsForProperty ( p ) ;
                if ( items.length == 0 ) return ;
                if ( undefined === rel[cq] ) rel[cq] = {} ;
                if ( undefined === rel[cq][p] ) rel[cq][p] = [] ;
                $.each ( items , function ( k1 , v1 ) {
                    v1.source_q = item.getID();
                    v1.target_q = v1.q ;
                    rel[cq][p].push ( v1 ) ;
                } ) ;
            } ) ;
        } ) ;

        var relations = { parents : {} , siblings : {} , children : {} , other : {} } ;
        var has_relations = false ;

        // Setting relations from main item
        $.each ( rel[q] , function ( p , ql ) {
            var section ;
            if ( p == me.P.father || p == me.P.mother) section = 'parents' ;
            else if ( p == me.P.brother || p == me.P.sister ) section = 'siblings' ;
            else if ( p == me.P.child ) section = 'children' ;
            else section = 'other' ;
            if ( relations[section][p] === undefined ) relations[section][p] = {} ;
            $.each ( ql , function (k,v){
                if ( relations[section][p][v.key] === undefined ) relations[section][p][v.key] = [] ;
                relations[section][p][v.key].push ( $.extend(true,{type:'item',mode:1},v) ) ;
                has_relations = true ;
            } ) ;
        } ) ;
//console.log(relations);


/*		
        // Setting relations "in reverse" from all other items
        $.each ( rel , function ( cq , props ) {
            if ( cq == q ) return ;
            $.each ( props , function ( p , ql ) {
                $.each ( ql , function ( k , v ) {
                    if ( v.type != 'item' || v.key != q ) return ; // Does not refer to main item
                    var section ;
                    var real_p = p ;
                    var val = {type:'item',mode:1} ;
                    if ( p == me.P.father || p == me.P.mother) {
                        section = 'children' ;
                        real_p = me.P.child ;
                    } else if ( p == me.P.brother || p == me.P.sister ) {
                        section = 'siblings' ;
                        if ( me.wd.items[cq].gender == 'M' ) real_p = me.P.brother ;
                        else if ( me.wd.items[cq].gender == 'F' ) real_p = me.P.sister ;
                        else val = {type:'item',mode:2} ;
                    } else if ( p == me.P.child ) {
                        section = 'parents' ;
                        if ( me.wd.items[cq].gender == 'M' ) real_p = me.P.father ;
                        else if ( me.wd.items[cq].gender == 'F' ) real_p = me.P.mother ;
                        else val = {type:'item',mode:2} ;
                    } else {
                        section = 'other' ;
                        if ( p != me.P.spouse ) val = {type:'item',mode:2} ;
                    }
                    val.q = cq ;
                    val.key = val.q ;
                    val.qualifiers = $.extend(true,{},v.qualifiers);
//					if ( val.q === undefined ) return ;
                    if ( relations[section][real_p] === undefined ) relations[section][real_p] = {} ;
                    if ( relations[section][real_p][cq] === undefined ) { // Do not overwrite "1" with "2"
                        relations[section][real_p][cq] = [] ;
                        relations[section][real_p][cq].push ( val ) ;
                    }
                } ) ;
            } ) ;
        } ) ;

        // Siblings by same father/mother
        var parents = [] ;
        $.each ( relations['parents'] , function ( cp , cd ) {
            $.each ( cd , function ( cq , dummy ) {
                parents.push ( cq ) ;
            } ) ;
        } ) ;

        $.each ( parents , function ( dummy , par ) {
            if ( undefined === rel[par] ) return ;
            if ( undefined === rel[par][me.P.child] ) return ;
            $.each ( rel[par][me.P.child] , function ( k , v ) {
                if ( v.type != 'item' ) return ;
                if ( v.key == q ) return ; // Refers to main item, had that
                var section = 'siblings' ;
                var real_p ;
                var val = {type:'item',mode:1} ;
                if ( me.wd.items[v.key] === undefined ) val = {type:'item',mode:2} ;
                else if ( me.wd.items[v.key].gender == 'M' ) real_p = me.P.brother ;
                else if ( me.wd.items[v.key].gender == 'F' ) real_p = me.P.sister ;
                else val = {type:'item',mode:2} ;
                val.q = v.key ;
                val.key = val.q ;
                val.qualifiers = $.extend(true,{},v.qualifiers);

                    if ( relations[section][real_p] === undefined ) relations[section][real_p] = {} ;
                    if ( relations[section][real_p][v.key] === undefined ) { // Do not overwrite "1" with "2"
                        relations[section][real_p][v.key] = [] ;
                        relations[section][real_p][v.key].push ( val ) ;
                    }
//				if ( relations[section][real_p] === undefined ) relations[section][real_p] = {} ;
//				if ( relations[section][real_p][v.key] === undefined ) relations[section][real_p][v.key] = val ; // Do not overwrite "1" with "2"
            } ) ;
        } ) ;
*/
        return relations ;
    } ,

    ucfirst : function ( s ) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    } ,

    getQlink : function ( q , options ) {
        var me = this ;
        if ( typeof options == 'undefined' ) options = {} ;
        var lang = options.lang || me.getMainLang() ;
        var ret = '' ;
        var label = options.label||(typeof me.wd.items[q]=='undefined'?q:me.wd.items[q].getLabel(lang)) ;

        if ( options.render_mode == 'text' ) {
            ret += label ;

        } else if ( options.render_mode == 'wikipedia' ) {

            var redlink = label ;
            if ( options.redlinks == 'autodesc' ) redlink = "<a class='redlink' href='//tools.wmflabs.org/autodesc/?q="+q+"&lang="+lang+"&mode=long&links=wikipedia&format=html&redlinks=autodesc'>" + label + "</a>" ;
            if ( options.redlinks == 'reasonator' ) redlink = "<a class='redlink' href='//tools.wmflabs.org/reasonator/?q="+q+"&lang="+lang+"'>" + label + "</a>" ;

            if ( typeof me.wd.items[q]=='undefined' ) {
                ret += redlink ;
            } else {
                var sitelinks = me.wd.items[q].getWikiLinks() ;
                if ( typeof sitelinks[lang+'wiki'] == 'undefined' ) ret += redlink ;
                else {
                    ret += "<a href='//" + lang + ".wikipedia.org/wiki/" + escape(sitelinks[lang+'wiki'].title.replace(/ /g,'_')) + "'>" ;
                    ret += label ;
                    ret += "</a>" ;
                }
            }

        } else if ( options.render_mode == 'wiki' ) {

            if ( typeof me.wd.items[q]=='undefined' ) {
                ret += label ;
            } else {
                var sitelinks = me.wd.items[q].getWikiLinks() ;
                if ( typeof sitelinks[lang+'wiki'] == 'undefined' ) ret += label ;
                else {
                    var title = sitelinks[lang+'wiki'].title ;
                    if ( me.ucfirst(title) != me.ucfirst(label) ) ret += "[[" + title + "|" + label + "]]" ;
                    else ret += "[[" + label + "]]" ;
                }
            }

        } else { // Default: HTML
            ret += "<a href='//www.wikidata.org/wiki/" + q + "'>" ;
            ret += label ;
            ret += "</a>" ;
        }
        return ret ;
    } ,

    getMainLang : function () {
        return 'en' ;
    } ,

    pad : function (number, length) {
        var str = '' + number;
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
    } ,

    addToLoadLater : function ( the_q , qualifiers_only ) {
        var self = this ;
        var to_load = [] ;
        if ( undefined === qualifiers_only ) qualifiers_only = false ;
        var i = self.wd.items[the_q] ;
        if ( typeof i == 'undefined' ) return ;
        $.each ( i.getPropertyList() , function ( k1 , p ) {
            to_load.push ( 'P'+(p+'').replace(/\D/g,'') ) ;
            if ( !qualifiers_only ) {
                var qs = i.getClaimItemsForProperty(p,true) ;
                $.each ( qs , function ( k2 , q2 ) {
                    to_load.push ( q2 ) ;
                } ) ;
            }
            $.each ( self.wd.items[the_q].raw.claims[p] , function ( dummy , c ) {
                $.each ( (c.qualifiers||[]) , function ( p2 , cv ) {
                    to_load.push ( p2 ) ;
                    $.each ( cv , function ( dummy2 , c ) {
                        if ( c.datavalue === undefined ) return ;
                        if ( c.datavalue.value === undefined ) return ;
                        if ( c.datavalue.value['entity-type'] != 'item' ) return ;
                        to_load.push ( 'Q'+c.datavalue.value['numeric-id'] ) ;
                    } ) ;
                } ) ;
            } ) ;
        } ) ;
        return to_load ;
    } ,

    the_end : true

} ;

reasonator.init();

exports.reasonator = reasonator ;
exports.wd = wd ;
