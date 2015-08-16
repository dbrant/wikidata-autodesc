'use strict';

var jsdom = require("jsdom");
var $ = require("jquery")(jsdom.jsdom().defaultView);

var propertiesList = require('./wd_properties').properties;
var P = propertiesList.P;
var Q = propertiesList.Q;

var describeHandlers = [];
describeHandlers.push( require('./desc_person') );
describeHandlers.push( require('./desc_taxon') );
describeHandlers.push( require('./desc_film') );
describeHandlers.push( require('./desc_generic') );


var wd_auto_desc = {

    api : '//www.wikidata.org/w/api.php' ,
    q_prefix : 'Q' ,
    p_prefix : 'P' ,
    color_not_found : '#FFFFC8' ,

// LANGUAGE-SPECIFIC DATA AND METHODS

    stockStrings : {
        'no_auto_content' : { en:'Cannot determine auto-content', vi:'Không thể xác định nội dung tự động', nl:'Kan geen automatische omschrijving genereren', pl:'Nie można automatycznie wygenerować opisu' } ,
        'generating_auto_content' : { en:'Generating auto-content...' , de:'Erzeuge automatische Beschreibung...', vi:'Đang tạo nội dung tự động…' , fr:'Génération...', nl:'Automatische omschrijving laden...', pl:'Generowanie automatycznego opisu…' } ,
        'query_error' : { en:'Query error' , de:'Abfrage-Fehler', vi:'Lỗi truy vấn' , fr:'Erreur de requête', nl:'Query-foutmelding', pl:'Błąd zapytania' } ,
        'not_found' : { en:'Not found' , de:'Nicht gefunden', el:'Δεν βρέθηκε', vi:'Không tìm thấy' , fr:'Introuvable', nl:'Niet gevonden', pl:'Nie znaleziono' } ,
        'cannot_describe' : { en:'Cannot auto-describe' , de:'Automatische Beschreibung nicht verfügbar', el:'Δεν μπορεί να περιγραφεί', vi:'Không thể miêu tả tự động' ,  fr:'Description automatique impossible', nl:'Geen automatische omschrijving beschikbaar', pl:'Nie jest dostępny automatyczny opis' } ,
        'disambig' : { en:'Wikipedia disambiguation page' , de:'Wikipedia-Begriffsklärungsseite', el:'Σελίδα αποσαφήνισης στη Βικιπαίδεια', vi:'Trang định hướng Wikipedia' , fr:'page d\'homonymie d\'un projet Wikimédia', nl:'Wikimedia-doorverwijspagina', pl:'Strona ujednoznaczniająca' } ,
        'person' : { en:'person' , de:'Person', el:'Πρόσωπο', vi:'người' , fr:'être humain', nl:'mens', pl:'osoba' } ,
        'in' : { en:'in', el:'στο',  vi:'trong' , fr:'à', nl:'in', pl:'w' } ,
        'by' : { en:'by' , de:'von', el:'του', vi:'bởi' , fr:'par', nl:'door', pl:'autorstwa' } ,
        'for' : { en:'for' , de:'für', el:'για', vi:'cho' , fr:'pour', nl:'voor', pl:'na' } ,
        'from' : { en:'from' , de:'von', el:'από', vi:'từ' , fr:'de', nl:'van', pl:'z' } ,
        'part of' : { en:'part of' , de:'Teil von', el:'μέρος του', vi:'một phần của' , fr:'partie de', nl:'onderdeel van', pl: 'stanowi część:' } ,
        'member of' : { en:'member of' , de:'Mitglied von', el:'μέλος του', vi:'thành viên của' , fr:'membre de', nl:'lid van', pl:'członek:' } ,
        'named after' : { en:'named after' , de:'benannt nach', vi:'đặt tên theo' , fr:'nommé en référence à', nl:'genoemd naar', pl:'nazwano imieniem:' } ,
        'child of' : { en:'child of' , de:'Kind von', el:'τέκνο του', vi:'con của' , fr:'enfant de', nl:'kind van', pl:'dziecko osoby:' } ,
        'spouse of' : { en:'spouse of' , de:'verheiratet mit', el:'σύζυγος του', vi:'vợ/chồng của' , fr:'conjoint de', nl:'echtgenoot van', pl:'małżonek osoby:' } ,
        'location' : { en:'Location' , de:'Lokalität', el:'Τοποθεσία', vi:'Vị trí', nl:'locatie', pl:'lokalizacja' } ,
        'in the field of' : { en:'in the field of' , de:'im Bereich' } ,
        'of' : { en:'of' , de:'von' } ,
        'produced by' : { en:'produced by' , de:'produziert von' } ,
        'in the constellation' : { en:'in the constellation' , de:'im Sternbild' } ,
        'BC' : { en:'BCE', el:'π.Χ.', vi:'TCN' , fr:'avant Jésus-Christ', nl:'A.D.', pl:'p.n.e.' }
    } ,

    modifierStrings : {
        en : {
            'nationality' : {'Ecuador':'Ecuadorian','Ghana':'Ghanaian','Russia':'Russian','Argentina':'Argentine','Australia':'Australian','Austria':'Austrian','Belgium':'Belgian','Brazil':'Brazilian','Canada':'Canadian','Chile':'Chilean','China':'Chinese','Denmark':'Danish','Finland':'Finnish','Faroe Islands':'Faroese','Netherlands':'Dutch','Puerto Rico':'Puerto Rican','France':'French','Luxembourg':'Luxembourgish','Germany':'German','Greece':'Greek','Holland':'Dutch','Hungary':'Hungarian','Iceland':'Icelander','India':'Indian','Iran':'Iranian','Iraq':'Iraqi','Ireland':'Irish','Israel':'Israeli','Indonesia':'Indonesian','Italy':'Italian','Japan':'Japanese','Jamaica':'Jamaican','Jordan':'Jordanian','Mexico':'Mexican','Nepal':'Nepalese','New Zealand':'New Zealander','Norway':'Norwegian','Pakistan':'Pakistani','Paraguay':'Paraguayan','Peru':'Peruvian','Poland':'Polish','Romania':'Romanian','Scotland':'Scottish','South Africa':'South African','Spain':'Spanish','Switzerland':'Swiss','Syria':'Syrian','Thailand':'Thai','Turkey':'Turkish','USA':'American','Uruguay':'Uruguayan','Venezuela':'Venezuelan','Wales':'Welsh','United Kingdom':'British','United States of America':'American','Sweden':'Swedish'}
        } ,
        de : {
            'nationality' : { 'Russland':'Russisch','Dänemark':'Dänisch','Norwegen':'Norwegisch','Niederlande':'Niederländisch','Deutschland':'Deutsch','Rumänien':'Rumänisch','Chile':'Chilenisch','Brasilien':'Brasilianisch','Vereinigtes Königreich':'Englisch' }
        } ,
        el : {
            'nationality' : {
                'Ελλάδα':'Έλληνας', 'Ρωσία':'Ρώσος','Δανία':'Δανός','Νορβηγία':'Νορβηγός','Ολλανδία':'Ολλανδός',
                'Γερμανία':'Γερμανός', 'Χιλή':'Χιλιανός','Βραζιλία':'Βραζιλιάνος', 'Γαλλία':'Γάλλος', 'Αγγλία':'Άγγλος',
                'Ηνωμένο Βασίλειο':'Βρετανός', 'Ηνωμένες Πολιτείες της Αμερικής':'Αμερικανός','Ισπανία':'Ισπανός',
                'Ιταλία':'Ιταλός', 'Τουρκία':'Τούρκος', 'Βουλγαρία':'Βούλγαρος','Αυστρία':'Αυστριακός',
                'Ηνωμένες Πολιτείες Αμερικής':'Αμερικανός','Σουηδία':'Σουηδός', 'Πολωνία':'Πολωνός',
                'Ουκρανία':'Ουκρανός', 'Ιρλανδία':'Ιρλανδός', 'Σερβία':'Σέρβος', 'Γιουγκοσλαβία':'Γιουγκοσλάβος'}
        } ,
        fr : {
            'nationality' : { 'Afghanistan':'afghan', 'Afrique du Sud':'sud-africain', 'Albanie':'albanais', 'Algérie':'algérien', 'Allemagne':'allemand', 'Andorre':'andorran', 'Angola':'angolais', 'Antigua-et-Barbuda':'d\'Antigua-et-Barbuda', 'Arabie saoudite':'saoudien', 'Argentine':'argentin', 'Arménie':'arménien', 'Australie':'australien', 'Autriche':'autrichien', 'Azerbaïdjan':'azerbaïdjanais', 'Bangladesh':'bangladais', 'Belgique':'belge', 'Brésil':'brésilien', 'Canada':'canadien', 'Chili':'chilien', 'Chine':'chinois', 'Danemark':'danois', 'Espagne':'espagnol', 'États-Unis':'américain', 'Finlande':'finlandais', 'France':'français', 'Grèce':'grec', 'Hongrie':'hongrois', 'Inde':'indien', 'Irlande':'irlandais', 'Islande':'islandais', 'Israël':'israélien', 'Italie':'italien', 'Japon':'japonais', 'Liban':'libanais', 'Norvège':'norvégien', 'Pays-Bas':'néerlandais', 'Pologne':'polonais', 'Portugal':'portugais', 'Roumanie':'roumain', 'Royaume-Uni':'britannique', 'Russie':'russe', 'Slovaquie':'slovaque', 'Slovénie':'slovène', 'Suisse':'suisse', 'Écosse':'écossais', 'Pays de Galles':'gallois', 'Angleterre':'anglais' }
        } ,
        vi : {
            'nationality' : {'Cộng hòa Nhân dân Trung Hoa':'Trung Quốc','Quần đảo Faroe':'Faroe','Cộng hòa Ireland':'Ireland','Nhật Bản':'Nhật','Cộng hòa Nam Phi':'Nam Phi','Hoa Kỳ':'Mỹ','Vương quốc Liên hiệp Anh và Bắc Ireland':'Anh','Cộng hòa Séc':'Séc','Cộng hòa Síp':'Síp','Cộng hòa Macedonia':'Macedonia','Cộng hòa Dân chủ Nhân dân Triều Tiên':'Triều Tiên','Cộng hòa Dân chủ Congo':'Congo','Cộng hòa Dominica':'Dominica','Cộng hòa Trung Phi':'Trung Phi'}
        } ,
        nl : {
            'nationality' : {'Ecuador':'Ecuadoraans','Ghana':'Ghanees','Rusland':'Russisch','Argentinië':'Argentijns','Australië':'Australisch','Oostenrijk':'Oostenrijks','België':'Belgisch','Brazilië':'Braziliaans','Canada':'Canadees','Chili':'Chileens','China':'Chinees','Denemarken':'Deens','Finland':'Fins','Faeröer':'Faeröers','Nederland':'Nederlands','Puerto Rico':'Puerto Ricaans','Frankrijk':'Frans','Luxemburg':'Luxemburgs','Duitsland':'Duits','Griekenland':'Grieks','Holland':'Nederlands','Hongarije':'Hongaars','IJsland':'IJslands','India':'Indiaas','Iran':'Iranees','Irak':'Irakees','Ierland':'Iers','Israël':'Israëlisch','Indonesië':'Indonesisch','Italië':'Italiaans','Japan':'Japans','Jamaica':'Jamaicaans','Jordanië':'Jordaans','Mexico':'Mexicaans','Nepal':'Nepalees','Nieuw-Zeeland':'Nieuw-Zeelands','Noorwegen':'Noors','Pakistan':'Pakistaans','Paraguay':'Paraguayaans','Peru':'Peruaans','Polen':'Pools','Roemenië':'Roemeens','Schotland':'Schots','Zuid-Afrika':'Zuid-Afrikaans','Spanje':'Spaans','Zwitserland':'Zwitsers','Syrië':'Syrisch','Thailand':'Thais','Turkije':'Turks','VS':'Amerikaans','Uruguay':'Uruguayaans','Venezuela':'Venezolaans','Wales':'Welsh','Verenigd Koninkrijk':'Brits','Verenigde Staten van Amerika':'Amerikaans','Zweden':'Zweeds'}
        } ,
        pl : {
            'nationality' : {'Polska':'polski/a', 'Niemcy':'niemiecki/a', 'Stany Zjednoczone':'amerykański/a', 'Francja':'francuski/a', 'Włochy':'włoski/a', 'Wielka Brytania':'brytyjski/a', 'Brazylia':'brazylijski/a', 'Norwegia':'norweski/a', 'Austria':'austriacki/a', 'Holandia':'holenderski/a', 'Kanada':'kanadyjski/a', 'Szwajcaria':'szwajcarski/a', 'Indie':'indyjski/a', 'Argentyna':'argentyński/a', 'Szwecja':'szwedzki/a', 'Hiszpania':'hiszpański/a', 'Belgia':'belgijski/a', 'Australia':'australijski/a', 'Japonia':'japoński/a', 'Nowa Zelandia':'nowozelandzki/a', 'Meksyk':'meksykański/a', 'Portugalia':'portugalski/a', 'Rosja':'rosyjski/a', 'Grecja':'grecki/a', 'Republika Południowej Afryki':'południowoafrykański/a', 'Turcja':'turecki/a', 'Czechy':'czeski/a', 'Finlandia':'fiński/a', 'Indonezja':'indonezyjski/a', 'Węgry':'węgierski/a', 'Chile':'chilijski/a', 'Dania':'duński/a', 'Malezja':'malezyjski/a', 'Kuba':'kubański/a', 'Korea Południowa':'południowokoreański/a', 'Iran':'irański/a', 'Irlandia':'irlandzki/a', 'Rumunia':'rumuński/a', 'Tajlandia':'tajlandzki/a', 'Ukraina':'ukraiński/a', 'Luksemburg':'luksemburski/a', 'Estonia':'estoński/a', 'Starożytny Rzym':'rzymski/a', 'Serbia':'serbski/a', 'Słowacja':'słowacki/a', 'Izrael':'izraelski/a', 'Związek Socjalistycznych Republik Radzieckich':'sowiecki/a', 'Paragwaj':'paragwajski/a', 'Chorwacja':'chorwacki/a', 'Urugwaj':'urugwajski/a', 'Bułgaria':'bułgarski/a', 'Nigeria':'nigeryjski/a', 'Łotwa':'łotewski/a', 'Haiti':'haitański/a', 'Egipt':'egipski/a', 'Armenia':'armeński/a,', 'Wybrzeże Kości Słoniowej':'iworyjski/a', 'Kolumbia':'kolumbijski/a', 'Filipiny':'filipiński/a', 'Litwa':'litewski/a', 'Słowenia':'słoweński/a', 'Islandia':'islandzki/a', 'Białoruś':'białoruski/a', 'Jamajka':'jamajski/a', 'Wenezuela':'wenezuelski/a', 'Gruzja':'gruziński/a', 'Kostaryka':'kostarykański/a', 'Maroko':'marokański/a', 'Tunezja':'tunezyjski/a', 'Jugosławia':'jugosłowiański/a', 'Nepal':'nepalski/a', 'Albania':'albański/a', 'Algieria':'algierski/a', 'Cesarstwo Bizantyńskie':'bizantyński/a', 'Czechosłowacja':'czechosłowacki/a', 'Irak':'iracki/a', 'Somalia':'somalijski/a', 'Azerbejdżan':'azerbejdżański/a', 'Kazachstan':'kazachski/a', 'Senegal':'senegalski/a', 'Ghana':'ghański/a', 'Malta':'maltański/a', 'Cypr':'cypryjski/a', 'Kamerun':'kameruński/a', 'Ekwador':'ekwadorski/a', 'Boliwia':'boliwijski/a', 'Kenia':'kenijski/a', 'Liban':'libański/a', 'Pakistan':'pakistański/a', 'Peru':'peruwiański/a', 'Afganistan':'afgański/a', 'Syria':'syryjski/a', 'Czarnogóra':'czarnogórski/a', 'Macedonia':'macedoński/a'}
        }
    } ,

    getStockString : function ( k , lang ) {
        if ( undefined !== this.stockStrings[k] ) {
            if ( undefined !== this.stockStrings[k][lang] ) return this.stockStrings[k][lang] ;
            return this.stockStrings[k]['en'] ;
        }
        return k ;
    } ,

    getModifierString : function ( t , k , lang ) {
        if ( this.modifierStrings[lang] === undefined ) return t ;
        if ( this.modifierStrings[lang][k] === undefined ) return t ;

        var m = t.match ( /^(<a.+>)(.+)(<\/a>)/ ) ;
        if ( null === m ) m = [ '' , '' , t , '' ] ;
        var k2 = m[2] ;

        if ( this.modifierStrings[lang][k][k2] === undefined ) return t ;
        return m[1] + this.modifierStrings[lang][k][k2] + m[3] ;
    } ,

    modifyWord : function ( word , hints , lang ) {
        if ( lang == 'en' ) {
            if ( hints.is_female ) {
                if ( word.toLowerCase() == 'actor' ) return 'actress' ;
                if ( word.toLowerCase() == 'actor / actress' ) return 'actress' ;
            } else if ( hints.is_male ) {
                if ( word.toLowerCase() == 'actor / actress' ) return 'actor' ;
            }
        } else if ( lang == 'fr' ) {
            if ( hints.is_female ) {
                if ( word.toLowerCase() == 'acteur' ) return 'actrice' ;
                if ( word.toLowerCase() == 'être humain' ) return 'personne' ;
            }
        } else if ( lang == 'de' ) {
            if ( hints.is_female ) {
                if ( hints.occupation ) {
                    word += 'in' ;
                }
            }
        }
        return word ;
    } ,

    listWords : function ( olist , hints , lang ) {
        var self = this ;
        var last;
        var list = $.merge ( [] , olist ) ;
        if ( hints !== undefined ) {
            $.each ( list , function ( k , v ) {
                list[k] = self.modifyWord ( v , hints , lang ) ;
            } ) ;
        }
        if ( lang == 'en' ) {
            if ( list.length == 1 ) return list[0] ;
            if ( list.length == 2 ) return list[0] + ' and ' + list[1] ;
            last = list.pop() ;
            return list.join ( ', ' ) + ', and ' + last ;
        } else if ( lang == 'de' ) {
            if ( list.length == 1 ) return list[0] ;
            if ( list.length == 2 ) return list[0] + ' und ' + list[1] ;
            last = list.pop() ;
            return list.join ( ', ' ) + ' und ' + last ;
        } else if ( lang == 'fr' ) {
            if ( list.length == 1 ) return list[0] ;
            if ( list.length == 2 ) return list[0] + ' et ' + list[1] ;
            last = list.pop() ;
            return list.join ( ', ' ) + ' et ' + last ;
        } else if ( lang == 'nl' ) {
            if ( list.length == 1 ) return list[0] ;
            if ( list.length == 2 ) return list[0] + ' en ' + list[1] ;
            last = list.pop() ;
            return list.join ( ', ' ) + ' en ' + last ;
        } else if ( lang == 'vi' ) {
            if ( list.length == 1 ) return list[0] ;
            if ( list.length == 2 ) return list[0] + ' và ' + list[1] ;
            last = list.pop() ;
            return list.join ( ', ' ) + ', và ' + last ;
        } else return list.join ( ', ' ) ;
    } ,

    ucFirst : function ( s ) {
        return s.substr(0,1).toUpperCase() + s.substr(1,s.length) ;
    } ,

    getNationalityFromCountry : function ( country , claims , hints ) {
        if ( hints === undefined ) hints = {} ;
        if ( hints.lang == 'en' ) {
            return this.getModifierString ( country , 'nationality' , hints.lang ) ;
        } else if ( hints.lang == 'de' ) {
            var n = this.getModifierString ( country , 'nationality' , hints.lang ) ;
            if ( this.modifierStrings[hints.lang]['nationality'][country] === undefined ) return n ;
            var is_female = this.hasPQ ( claims , P.sex , Q.female ) ;
            if ( hints.not_last ) n += '' ;
            else if ( is_female ) n += 'e' ;
            else n += 'er' ;
            return n ;
        } else {
            return this.getModifierString ( country , 'nationality' , hints.lang ) ;
        }
    } ,

    splitLink : function ( v ) {
        var ret = null ;
        if ( ret == null ) ret = v.match ( /^(\[\[.+\|)(.+)(\]\])$/ ) ;
        if ( ret == null ) {
            ret = v.match ( /^(\[\[)(.+)(\]\])$/ ) ;
            if ( ret != null ) ret[1] += ret[2] + '|' ;
        }
        if ( ret == null ) ret = v.match ( /^(<a.+?>)(.+)(<\/a>)$/ ) ;
        if ( ret == null ) ret = [ '' , '' , v , '' ] ;
        return ret ;
    } ,


    isDisambig : function ( claims ) {
        return ( this.hasPQ ( claims, P.instance_of, Q.disambiguation_page ) ) ;
    } ,


    getNationality : function ( item_labels , claims , opt ) {
        var self = this;
        var h2 = '' ;
        var tmp = item_labels[P.nationality]||[] ;
        $.each ( tmp , function ( k , v ) {
            var v2 = self.splitLink ( v ) ;
            var s = self.getNationalityFromCountry ( v2[2] , claims , { lang:opt.lang , not_last:(k+1!=tmp.length) } ) ;
            if ( k == 0 ) h2 = v2[1]+s+v2[3] ;
            else h2 += '-' + v2[1] + s.toLowerCase() + v2[3] ; // Multi-national
        } ) ;
        return h2;
    },

    getCountryOfOrigin : function ( item_labels , claims , opt ) {
        var self = this;
        var h2 = '' ;
        var tmp = item_labels[P.country_of_origin]||[] ;
        $.each ( tmp , function ( k , v ) {
            var v2 = self.splitLink ( v ) ;
            var s = self.getNationalityFromCountry ( v2[2] , claims , { lang:opt.lang , not_last:(k+1!=tmp.length) } ) ;
            if ( k == 0 ) h2 = v2[1]+s+v2[3] ;
            else h2 += '-' + v2[1] + s.toLowerCase() + v2[3] ; // Multi-national
        } ) ;
        return h2;
    },

    add2desc : function ( h , item_labels , props , opt ) {
        if ( typeof opt == 'undefined' ) {
            opt = {} ;
            console.log ( "NO opt IN add2desc" ) ;
        }
        var self = this ;
        var h2 = [] ;
        var x = [] ;
        var lang ;
        if ( typeof lang == 'undefined' && typeof opt.lang != 'undefined' ) lang = opt.lang ;
        if ( typeof lang == 'undefined' && typeof opt.o != 'undefined' ) lang = opt.o.lang ;
        if ( typeof lang == 'undefined' && typeof opt.hints != 'undefined' && typeof opt.hints.o != 'undefined' ) lang = opt.hints.o.lang ;
        if ( typeof lang == 'undefined' ) console.log ( "NO LANG" ) ;
        $.each ( props , function ( k , prop ) {
            $.merge ( x , item_labels[prop]||[] ) ;
        } ) ;
        $.each ( x , function ( k , v ) {
            if (undefined !== opt.max_count && k >= opt.max_count) {
                return;
            }
            h2.push ( v ) ;
        } ) ;
        if ( h2.length > 0 ) {
            if ( undefined !== opt.prefix && h.length > 0 ) h[h.length-1] += opt.prefix ;
            var s = self.listWords ( h2 , opt.hints , lang ) ;
            if ( undefined !== opt.txt_key ) s = self.getStockString(opt.txt_key, lang) + ' ' + s ;
            h.push ( s ) ;
        }
    } ,

    loadItem : function ( q , opt ) {
        var self = this ;
        q = q.toUpperCase() ;
        opt.q = q ;

        self.wd.getItemBatch ( [ q ] , function () {
            self.main_data = self.wd.items[q].raw ;
            var claims = self.wd.items[q].raw.claims || [] ;

            for (var i = 0; i < describeHandlers.length; i++) {
                if ( describeHandlers[i].matchType(self, claims) ) {
                    describeHandlers[i].describe(self, q, claims, opt, function ( text ) {

                        text = self.ucFirst( text ).replace ( /  +/g , ' ' );
                        if ( undefined !== opt.callback ) opt.callback ( q , text , opt ) ;

                    });
                    break;
                }
            }
        } ) ;

    } ,

    hasP : function ( claims , p ) {
        return ( undefined !== claims[this.p_prefix+p] );
    } ,

    hasPQ : function ( claims , p , q ) {
        p = this.p_prefix+p ;
        if ( undefined === claims[p] ) return false ;
        var ret = false ;
        $.each ( claims[p] , function ( k , v ) {
            if ( undefined === v.mainsnak ) return ;
            if ( undefined === v.mainsnak.datavalue ) return ;
            if ( undefined === v.mainsnak.datavalue.value ) return ;
            if ( undefined === v.mainsnak.datavalue.value['numeric-id'] ) return ;
            if ( q != v.mainsnak.datavalue.value['numeric-id'] ) return ;
            ret = true ;
        } ) ;
        return ret ;
    } ,

    addItemsFromClaims : function ( claims , p , items ) { // p numerical
        var self = this ;
        if ( undefined === claims[self.p_prefix+p] ) return ;
        $.each ( claims[self.p_prefix+p] , function ( k , v ) {
            if ( undefined === v.mainsnak ) return ;
            if ( undefined === v.mainsnak.datavalue ) return ;
            if ( undefined === v.mainsnak.datavalue.value ) return ;
            if ( undefined === v.mainsnak.datavalue.value['numeric-id'] ) return ;
            items.push ( [ p , self.q_prefix+v.mainsnak.datavalue.value['numeric-id'] ] ) ;
        } ) ;
    } ,

    getYear : function ( claims , p , lang ) { // p numerical
        var self = this ;
        p = self.p_prefix+p ;
        if ( undefined === claims[p] ) return '' ;
        var ret = '' ;
        $.each ( claims[p] , function ( k , v ) {
            if ( undefined === v.mainsnak ) return ;
            if ( undefined === v.mainsnak.datavalue ) return ;
            if ( undefined === v.mainsnak.datavalue.value ) return ;
            if ( undefined === v.mainsnak.datavalue.value['time'] ) return ;
            var t = v.mainsnak.datavalue.value['time'];
            if (t !== null && t.length > 4) {
                if (t.substring(0,1) === "+") {
                    t = t.substring(1);
                }
                var d = new Date(t);
                ret = d.getUTCFullYear();
            }
            //if ( m[1] == '-' ) ret += self.getStockString('BC',lang) ;
        } ) ;
        return ret ;
    } ,


    labelItems : function ( items , callback , opt ) {
        var self = this ;

        if ( undefined === opt ) opt = {} ;
        var use_lang = opt.lang ;

        if ( items.length == 0 ) {
            callback ( {} ) ;
            return ;
        }

        var i_nonunique = [] ;
        $.each ( items , function ( k , v ) {
            i_nonunique.push ( v[1] ) ;
        } ) ;
        var i = [];
        $.each(i_nonunique, function(k, v){
            if($.inArray(v, i) === -1) i.push(v);
        });

        self.wd.getItemBatch ( i , function () {
            var cb = {} ;
            $.each ( i||[] , function ( dummy0 , q ) {
                var v = self.wd.items[q].raw ;
                if ( v.labels === undefined ) return ;

                var curlang = use_lang ; // Try set language
                if ( v.labels[curlang] === undefined ) { // Try main languages
                    $.each ( ['en','de','fr','es','it','pl','pt','ja','ru','hu','nl'] , function ( k2 , v2 ) {
                        if ( v.labels[k2] === undefined ) return ;
                        curlang = k2 ;
                        return false ;
                    } ) ;
                }

                if ( v.labels[curlang] === undefined ) { // Take any language
                    $.each ( v.labels , function ( k2 , v2 ) {
                        curlang = k2 ;
                        return false ;
                    } ) ;
                }

                if ( v.labels[curlang] === undefined ) return ;
                var p = [] ;
                $.each ( items , function ( k , v ) {
                    if ( v[1] == q ) p.push( v[0] );
                } ) ;

                var label = v.labels[curlang].value ;

                $.each ( p , function ( k , v ) {
                    if ( cb[v] === undefined ) cb[v] = [] ;
                    cb[v].push ( label ) ;
                } ) ;

                /*
                var linktarget = (opt.linktarget===undefined?'':" target='"+opt.linktarget+"'") ;
                if ( opt.links == 'wikidata' ) {
                    cb[p].push ( "<a href='//www.wikidata.org/wiki/"+ q + "'" + linktarget +">" + label + "</a>" ) ;
                } else if ( opt.links == 'reasonator_local' ) {
                    cb[p].push ( "<a href='?lang="+opt.reasonator_lang+"&q="+ q + "'" + linktarget +">" + label + "</a>" ) ;
                } else if ( opt.links == 'reasonator' ) {
                    cb[p].push ( "<a href='/reasonator/?lang="+opt.reasonator_lang+"&q="+ q + "'" + linktarget +">" + label + "</a>" ) ;

                } else if ( opt.links == 'wiki' ) {

                    if ( undefined !== v.sitelinks && undefined !== v.sitelinks[use_lang+'wiki'] ) {
                        var page = v.sitelinks[use_lang+'wiki'].title ;
                        if ( page == label ) cb[p].push ( "[["+ label +"]]" ) ;
                        else cb[p].push ( "[["+ page + "|" + label +"]]" ) ;
                    } else {
                        cb[p].push ( ""+ label +"" ) ; // TODO {{redwd}}
                    }

                } else if ( opt.links == 'wikipedia' && undefined !== v.sitelinks && undefined !== v.sitelinks[use_lang+'wiki'] ) {
                    var page = self.wikiUrlencode ( v.sitelinks[use_lang+'wiki'].title ) ;
                    if ( opt.local_links ) cb[p].push ( "<a href='/wiki/"+ page + "'" + linktarget +">" + label + "</a>" ) ;
                     else cb[p].push ( "<a href='//"+use_lang+".wikipedia.org/wiki/"+ page + "'" + linktarget +">" + label + "</a>" ) ;
                } else if ( opt.links != '' && undefined !== v.sitelinks && undefined !== v.sitelinks[use_lang+opt.links] ) {
                    var page = self.wikiUrlencode ( v.sitelinks[use_lang+opt.links].title ) ;
                    if ( opt.local_links ) cb[p].push ( "<a href='/wiki/"+ page + "'" + linktarget +">" + label + "</a>" ) ;
                     else cb[p].push ( "<a href='//"+use_lang+"."+opt.links+".org/wiki/"+ page + "'" + linktarget +">" + label + "</a>" ) ;
                } else cb[p].push ( label ) ;
                */

            } ) ;
            callback ( cb ) ;
        } ) ;
    } ,

    labelItem : function ( q , callback , opt ) {
        this.labelItems ( [ [0,q] ] , function ( item_labels ) {
            callback ( ((item_labels||[])[0]||[])[0] ) ;
        } , opt ) ;
    } ,

    wikiUrlencode : function ( s ) {
        return escape ( s.replace(/ /g,'_') ) ;
    } ,

    fin:''
};

exports.ad = wd_auto_desc;
