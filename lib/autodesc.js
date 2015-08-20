'use strict';

var wd = require('./wikidata').wd ;
var propertiesList = require('./wd_properties').properties;
var P = propertiesList.P;
var Q = propertiesList.Q;

var describeHandlers = [];
// the order in which these are added matters (make sure Generic is last).
describeHandlers.push( require('./desc_person') );
describeHandlers.push( require('./desc_taxon') );
describeHandlers.push( require('./desc_film') );
describeHandlers.push( require('./desc_book') );
describeHandlers.push( require('./desc_city') );
describeHandlers.push( require('./desc_element') );
describeHandlers.push( require('./desc_band') );
describeHandlers.push( require('./desc_generic') );


var wd_auto_desc = {

    api : '//www.wikidata.org/w/api.php' ,
    q_prefix : 'Q' ,
    p_prefix : 'P' ,
    color_not_found : '#FFFFC8' ,

    logd : function ( text ) {
        console.log(text);
    } ,

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
            'nationality' : {'Ecuador':'Ecuadorian','Ghana':'Ghanaian','Russia':'Russian','Argentina':'Argentine','Australia':'Australian',
                'Austria':'Austrian','Belgium':'Belgian','Brazil':'Brazilian','Canada':'Canadian','Chile':'Chilean','China':'Chinese',
                'Denmark':'Danish','Finland':'Finnish','Faroe Islands':'Faroese','Netherlands':'Dutch','Puerto Rico':'Puerto Rican',
                'France':'French','Luxembourg':'Luxembourgish','Germany':'German','Greece':'Greek','Holland':'Dutch','Hungary':'Hungarian',
                'Iceland':'Icelander','India':'Indian','Iran':'Iranian','Iraq':'Iraqi','Ireland':'Irish','Israel':'Israeli',
                'Indonesia':'Indonesian','Italy':'Italian','Japan':'Japanese','Jamaica':'Jamaican','Jordan':'Jordanian','Mexico':'Mexican',
                'Nepal':'Nepalese','New Zealand':'New Zealander','Norway':'Norwegian','Pakistan':'Pakistani','Paraguay':'Paraguayan',
                'Peru':'Peruvian','Poland':'Polish','Romania':'Romanian','Scotland':'Scottish','South Africa':'South African',
                'Spain':'Spanish','Switzerland':'Swiss','Syria':'Syrian','Thailand':'Thai','Turkey':'Turkish','USA':'American',
                'Uruguay':'Uruguayan','Venezuela':'Venezuelan','Wales':'Welsh','United Kingdom':'British',
                'United States of America':'American','Sweden':'Swedish','Egypt':'Egyptian','Tibet':'Tibetan',
                'Vatican City':''}
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

    generalTransforms : function ( text ) {
        var ret = text;
        ret = ret.replace("United States of America", "United States");
        return ret;
    } ,

    modifyWord : function ( word , hints , lang ) {
        if ( lang == 'en' ) {
            if ( hints.is_female ) {
                if (word.toLowerCase().indexOf("actor") > -1) word = word.toLowerCase().replace('actor', 'actress');
            } else if ( hints.is_male ) {
                if (word.toLowerCase().indexOf("actress") > -1) word = word.toLowerCase().replace('actress', 'actor');
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

    wikiUrlencode : function ( s ) {
        return escape ( s.replace(/ /g,'_') ) ;
    } ,

    getOrdinal : function(n) {
        var s=["th","st","nd","rd"],
            v=n%100;
        return n+(s[(v-20)%10]||s[v]||s[0]);
    } ,

    listWords : function ( olist , hints , lang ) {
        var self = this ;
        var last, count;
        var list = [];
        olist.forEach( function(v) { list.push(v); });

        if ( hints !== undefined ) {
            for (count = 0; count < list.size; count++) {
                list[count] = self.modifyWord ( list[count] , hints , lang ) ;
            }
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
        if ( hints.lang == 'de' ) {
            var n = this.getModifierString ( country , 'nationality' , hints.lang ) ;
            if ( this.modifierStrings[hints.lang]['nationality'][country] === undefined ) return n ;
            var is_female = this.hasPQ ( claims , P.sex , Q.female ) ;
            if ( hints.not_last ) n += '' ;
            else if ( is_female ) n += 'e' ;
            else n += 'er' ;
            return n ;
        } else {
            var ancientIndex = country.toLowerCase().indexOf("ancient");
            var ret;
            if (ancientIndex == 0) {
                ret = this.getModifierString ( country.substring(ancientIndex + 7).trim() , 'nationality' , hints.lang );
                ret = "Ancient " + ret;
            } else {
                ret = this.getModifierString(country, 'nationality', hints.lang);
            }
            return ret;
        }
    } ,

    getNationality : function ( claims , opt ) {
        var self = this;
        var h2 = '' ;
        var tmp = self.getP(claims, P.nationality);
        var i, s;
        for (i = 0; i < tmp.length; i++) {
            s = self.getNationalityFromCountry ( tmp[i].qLabel , claims , { lang:opt.lang , not_last:(i+1!=tmp.length) } ) ;
            if ( i == 0 ) h2 = s ;
            else h2 += '-' + s.toLowerCase(); // Multi-national
        }
        if (h2.length === 0) {
            // try country of origin...
            tmp = self.getP(claims, P.country_of_origin);
            for (i = 0; i < tmp.length; i++) {
                s = self.getNationalityFromCountry ( tmp[i].qLabel , claims , { lang:opt.lang , not_last:(i+1!=tmp.length) } ) ;
                if ( i == 0 ) h2 = s ;
                else h2 += '-' + s.toLowerCase(); // Multi-national
            }
        }
        return h2;
    },

    getCountryOfOrigin : function ( claims , opt ) {
        var self = this;
        var h2 = '' ;
        var tmp = self.getP(claims, P.country_of_origin);
        if (tmp.length == 0) {
            tmp = self.getP(claims, P.country);
        }
        if (tmp.length == 0) {
            tmp = self.getP(claims, P.nationality);
        }
        for (var i = 0; i < tmp.length; i++) {
            var s = self.getNationalityFromCountry ( tmp[i].qLabel , claims , { lang:opt.lang , not_last:(i+1!=tmp.length) } ) ;
            if ( i == 0 ) h2 = s ;
            else h2 += '-' + s.toLowerCase(); // Multi-national
        }
        return h2;
    },

    isDisambig : function ( claims ) {
        return ( this.hasPQ ( claims, P.instance_of, Q.disambiguation_page ) ) ;
    } ,

    getTargetQNum : function ( claim ) {
        if ( claim === undefined ) return undefined ;
        if ( claim.mainsnak === undefined ) return undefined ;
        if ( claim.mainsnak.datavalue === undefined ) return undefined ;
        if ( claim.mainsnak.datavalue.value === undefined ) return undefined ;
        if ( claim.mainsnak.datavalue.value['entity-type'] != 'item' ) return undefined ;
        if ( claim.mainsnak.datavalue.value['numeric-id'] === undefined ) return undefined ;
        return claim.mainsnak.datavalue.value['numeric-id'] ;
    } ,

    addEmptyClaim : function ( claims, p, q ) {
        p = this.p_prefix+p;
        claims[p] = [];
        claims[p].push({});
        claims[p][0].mainsnak = {};
        claims[p][0].mainsnak.datavalue = {};
        claims[p][0].mainsnak.datavalue.value = {};
        claims[p][0].mainsnak.datavalue.value['entity-type'] = 'item';
        claims[p][0].mainsnak.datavalue.value['numeric-id'] = q;
    } ,

    add2desc : function ( h , claims , props , opt ) {
        if ( typeof opt == 'undefined' ) {
            opt = {} ;
        }
        var self = this ;
        var wordList = [] ;
        var i, j, lang ;
        if ( typeof lang == 'undefined' && typeof opt.lang != 'undefined' ) lang = opt.lang ;
        if ( typeof lang == 'undefined' && typeof opt.o != 'undefined' ) lang = opt.o.lang ;
        if ( typeof lang == 'undefined' && typeof opt.hints != 'undefined' && typeof opt.hints.o != 'undefined' ) lang = opt.hints.o.lang ;
        if ( typeof lang == 'undefined' ) self.logd ( "NO LANG" ) ;
        var finalLabel;
        props.forEach( function ( prop ) {
            (claims[self.p_prefix+prop]||[]).forEach( function( claim ) {
                finalLabel = '';

                // Does the claim have an ordinal?
                var ordVal = self.getQualifierValue(claim, P.series_ordinal);
                if (ordVal !== null) {
                    finalLabel += self.getOrdinal(ordVal) + ' ';
                }

                finalLabel += claim.qLabel;

                // Make sure the label is unique among the labels we already have.
                if (wordList.indexOf(finalLabel) == -1) {
                    wordList.push(finalLabel);
                }
            } );
        } ) ;

        // check if any items are substrings of other items, and remove them
        var itemsToRemove = [];
        for (i=0; i<wordList.length; i++) {
            for (j=0; j<wordList.length; j++) {
                if (i == j) continue;
                if (wordList[i].indexOf(wordList[j]) > -1) {
                    if (itemsToRemove.indexOf(j) == -1) {
                        itemsToRemove.push(j);
                    }
                }
            }
        }
        itemsToRemove.forEach(function (v) {
            wordList.splice(v, 1);
        });

        // clamp the number of words, if requested
        if (undefined !== opt.max_count && wordList.length > opt.max_count) {
            wordList.splice(opt.max_count, wordList.length-opt.max_count);
        }

        if ( wordList.length > 0 ) {
            if ( undefined !== opt.prefix && h.length > 0 ) h[h.length-1] += opt.prefix ;
            var s = self.listWords ( wordList , opt.hints , lang ) ;
            if ( undefined !== opt.txt_key ) s = self.getStockString(opt.txt_key, lang) + ' ' + s ;
            h.push ( s ) ;
        }
    } ,

    initClaimLabels : function ( claims ) {
        var self = this;
        for (var prop in claims) {
            if (!claims.hasOwnProperty(prop)) {
                continue;
            }
            claims[prop].forEach(function (v) {
                v.qLabel = '';
            });
        }
    } ,

    hasP : function ( claims , p ) {
        return (this.getP(claims, p).length > 0);
    } ,

    getP : function ( claims , p ) {
        return claims[this.p_prefix+p]||[];
    } ,

    hasPQ : function ( claims , p , q ) {
        return this.getPQ(claims, p, q) !== null;
    } ,

    getPQ : function ( claims , p , q ) {
        var self = this;
        p = this.p_prefix+p ;
        var ret = null;
        if ( undefined === claims[p] ) return ret;
        claims[p].forEach( function ( v ) {
            if ( q != self.getTargetQNum(v) ) return;
            ret = v ;
        } ) ;
        return ret ;
    } ,

    addItemsFromClaims : function ( claims , pArray , items ) {
        var self = this ;
        pArray.forEach( function(p) {
            if ( undefined === claims[self.p_prefix+p] ) return ;
            claims[self.p_prefix+p].forEach( function ( claim ) {
                items.push( claim ) ;
            }) ;
        });
    } ,

    getPValues : function ( claims , p ) { // p numerical
        var self = this ;
        p = self.p_prefix+p ;
        var ret = [] ;
        if ( undefined === claims[p] ) return ret ;
        claims[p].forEach( function ( v ) {
            if ( undefined === v.mainsnak ) return ;
            if ( undefined === v.mainsnak.datavalue ) return ;
            if ( undefined === v.mainsnak.datavalue.value ) return ;
            if ( undefined === v.mainsnak.datavalue.type ) return ;

            console.log(">>> " + JSON.stringify(v.mainsnak.datavalue));

            var val = '';
            if (v.mainsnak.datavalue.type == 'time') {
                if ( undefined === v.mainsnak.datavalue.value['time'] ) return ;
                val = v.mainsnak.datavalue.value['time'].toString();
            } else if (v.mainsnak.datavalue.type == 'quantity') {
                if ( undefined === v.mainsnak.datavalue.value['amount'] ) return ;
                val = v.mainsnak.datavalue.value['amount'].toString();
            } else if (v.mainsnak.datavalue.type == 'string') {
                val = v.mainsnak.datavalue.value.toString();
            }
            if (val !== null && val.length > 1 && val.substring(0,1) === "+") {
                val = val.substring(1);
            }
            ret.push(val);
        } ) ;
        return ret;
    } ,

    getQualifier : function ( claim, qualifier ) {
        var self = this ;
        if ( undefined === claim.qualifiers ) return null;
        if ( undefined === claim.qualifiers[self.p_prefix+qualifier] ) return null;
        return claim.qualifiers[self.p_prefix+qualifier];
    } ,

    getQualifierValue : function ( claim, qualifier ) {
        var self = this ;
        var ret = null;
        var qual = self.getQualifier(claim, qualifier);
        if (qual === null) return ret;
        qual.forEach(function (item) {
            if (undefined === item.datavalue) return;
            if (undefined === item.datavalue.value) return;
            ret = item.datavalue.value;
        });
        return ret;
    } ,

    getYear : function ( claims , p , lang ) { // p numerical
        var self = this ;
        var ret = '' ;
        var dates = self.getPValues( claims, p );
        if (dates.length == 0) return ret;
        var t = dates[0];
        if (t !== null && t.length > 4) {
            var bce = false;
            if (t.substring(0,1) === "-") {
                t = t.substring(1);
                bce = true;
            }
            while (t.length > 4 && t.substring(0,1) === '0') {
                t = t.substring(1);
            }
            var tarray = t.split('-');
            if (tarray !== null && tarray.length > 0) {
                ret = tarray[0];
                if (bce) {
                    ret += self.getStockString('BC', lang);
                }
            }
        }
        return ret;
    } ,

    labelItems : function ( claims , callback , opt ) {
        var self = this ;

        if (undefined === opt) opt = {};
        var use_lang = opt.lang;

        if (claims.length == 0) {
            callback({});
            return;
        }

        var itemsToFetch = [];
        claims.forEach(function (claim) {
            if (undefined === self.getTargetQNum(claim)) {
                self.logd("Warning: claim without Q-id");
            } else {
                var qId = self.getTargetQNum(claim);
                if (qId != 0) {
                    itemsToFetch.push(self.q_prefix+qId);
                }
            }
        });

        self.logd("Fetching batch of items: " + JSON.stringify(itemsToFetch));
        wd.getItemBatch(itemsToFetch, function () {
            self.logd("Back from fetching.");
            try {
                (itemsToFetch || []).forEach(function (q) {
                    var v = wd.items[q].raw;
                    if (v.labels === undefined) return;

                    var curlang = use_lang; // Try set language
                    var count;
                    if (v.labels[curlang] === undefined) { // Try main languages
                        count = 0;
                        (['en', 'de', 'fr', 'es', 'it', 'pl', 'pt', 'ja', 'ru', 'hu', 'nl']).forEach( function (v2) {
                            if (v.labels[count] === undefined){
                                count++;
                                return;
                            }
                            curlang = count;
                            return false;
                        });
                    }

                    if (v.labels[curlang] === undefined) { // Take any language
                        count = 0;
                        v.labels.forEach( function (v2) {
                            curlang = count;
                            return false;
                        });
                    }

                    if (v.labels[curlang] === undefined) return;
                    var label = v.labels[curlang].value;

                    claims.forEach(function (claim) {
                        if ((self.q_prefix+self.getTargetQNum(claim)) == q) {
                            claim.qLabel = label;
                        }
                    });

                });
                callback();
            }catch(err){
                self.logd("Error: " + err.message + "\n" + err.stack);
            }
        });
    } ,

    getDescription : function ( q , opt, callback ) {
        var self = this;
        q = q.toUpperCase();
        opt.q = q;

        self.logd("Fetching claims for " + q + "...");
        wd.getItemBatch([q], function () {
            self.logd("Back from fetching.");
            if (undefined === wd.items[q]) {
                callback("");
                return;
            }
            var claims = wd.items[q].raw.claims || [];
            self.initClaimLabels(claims);

            for (var i = 0; i < describeHandlers.length; i++) {
                if (describeHandlers[i].matchType(self, claims)) {
                    describeHandlers[i].describe(self, claims, opt, function (text) {

                        text = self.ucFirst(text).replace(/  +/g, ' ');
                        text = self.generalTransforms(text);
                        callback(text);

                        // TODO: remove when not debugging:
                        // un-define this Q item
                        wd.items[q] = undefined;

                    });
                    break;
                }
            }
        });
    } ,

    fin:''
};

exports.ad = wd_auto_desc;
exports.wd = wd;
