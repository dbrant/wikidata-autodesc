(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var autodesc = require('./lib/autodesc');

window.getWikidataDescription = function(title, callback) {
    var params = {
        lang: "en"
    };
    autodesc.ad.getDescription ( title , params , function ( qnum, text ) {
        var label = "";
        var manual_desc = "";
        if (undefined !== autodesc.wd.items[qnum]) {
            label = autodesc.wd.items[qnum].getLabel(params.lang);
            manual_desc = autodesc.wd.items[qnum].getDesc(params.lang);
        }
        callback(qnum, label, manual_desc, text);
    });
};

},{"./lib/autodesc":2}],2:[function(require,module,exports){
'use strict';

var wd = require('./wikidata').wd;
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
            'nationality' : { 'Russland':'Russisch','Dänemark':'Dänisch','Norwegen':'Norwegisch','Niederlande':'Niederländisch',
                'Deutschland':'Deutsch','Rumänien':'Rumänisch','Chile':'Chilenisch','Brasilien':'Brasilianisch','Vereinigtes Königreich':'Englisch' }
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
            'nationality' : { 'Afghanistan':'afghan', 'Afrique du Sud':'sud-africain', 'Albanie':'albanais', 'Algérie':'algérien',
                'Allemagne':'allemand', 'Andorre':'andorran', 'Angola':'angolais', 'Antigua-et-Barbuda':'d\'Antigua-et-Barbuda',
                'Arabie saoudite':'saoudien', 'Argentine':'argentin', 'Arménie':'arménien', 'Australie':'australien', 'Autriche':'autrichien',
                'Azerbaïdjan':'azerbaïdjanais', 'Bangladesh':'bangladais', 'Belgique':'belge', 'Brésil':'brésilien', 'Canada':'canadien',
                'Chili':'chilien', 'Chine':'chinois', 'Danemark':'danois', 'Espagne':'espagnol', 'États-Unis':'américain', 'Finlande':'finlandais',
                'France':'français', 'Grèce':'grec', 'Hongrie':'hongrois', 'Inde':'indien', 'Irlande':'irlandais', 'Islande':'islandais',
                'Israël':'israélien', 'Italie':'italien', 'Japon':'japonais', 'Liban':'libanais', 'Norvège':'norvégien', 'Pays-Bas':'néerlandais',
                'Pologne':'polonais', 'Portugal':'portugais', 'Roumanie':'roumain', 'Royaume-Uni':'britannique', 'Russie':'russe',
                'Slovaquie':'slovaque', 'Slovénie':'slovène', 'Suisse':'suisse', 'Écosse':'écossais', 'Pays de Galles':'gallois', 'Angleterre':'anglais' }
        } ,
        vi : {
            'nationality' : {'Cộng hòa Nhân dân Trung Hoa':'Trung Quốc','Quần đảo Faroe':'Faroe','Cộng hòa Ireland':'Ireland',
                'Nhật Bản':'Nhật','Cộng hòa Nam Phi':'Nam Phi','Hoa Kỳ':'Mỹ','Vương quốc Liên hiệp Anh và Bắc Ireland':'Anh',
                'Cộng hòa Séc':'Séc','Cộng hòa Síp':'Síp','Cộng hòa Macedonia':'Macedonia','Cộng hòa Dân chủ Nhân dân Triều Tiên':'Triều Tiên',
                'Cộng hòa Dân chủ Congo':'Congo','Cộng hòa Dominica':'Dominica','Cộng hòa Trung Phi':'Trung Phi'}
        } ,
        nl : {
            'nationality' : {'Ecuador':'Ecuadoraans','Ghana':'Ghanees','Rusland':'Russisch','Argentinië':'Argentijns','Australië':'Australisch',
                'Oostenrijk':'Oostenrijks','België':'Belgisch','Brazilië':'Braziliaans','Canada':'Canadees','Chili':'Chileens','China':'Chinees',
                'Denemarken':'Deens','Finland':'Fins','Faeröer':'Faeröers','Nederland':'Nederlands','Puerto Rico':'Puerto Ricaans',
                'Frankrijk':'Frans','Luxemburg':'Luxemburgs','Duitsland':'Duits','Griekenland':'Grieks','Holland':'Nederlands','Hongarije':'Hongaars',
                'IJsland':'IJslands','India':'Indiaas','Iran':'Iranees','Irak':'Irakees','Ierland':'Iers','Israël':'Israëlisch','Indonesië':'Indonesisch',
                'Italië':'Italiaans','Japan':'Japans','Jamaica':'Jamaicaans','Jordanië':'Jordaans','Mexico':'Mexicaans','Nepal':'Nepalees',
                'Nieuw-Zeeland':'Nieuw-Zeelands','Noorwegen':'Noors','Pakistan':'Pakistaans','Paraguay':'Paraguayaans','Peru':'Peruaans',
                'Polen':'Pools','Roemenië':'Roemeens','Schotland':'Schots','Zuid-Afrika':'Zuid-Afrikaans','Spanje':'Spaans','Zwitserland':'Zwitsers',
                'Syrië':'Syrisch','Thailand':'Thais','Turkije':'Turks','VS':'Amerikaans','Uruguay':'Uruguayaans','Venezuela':'Venezolaans',
                'Wales':'Welsh','Verenigd Koninkrijk':'Brits','Verenigde Staten van Amerika':'Amerikaans','Zweden':'Zweeds'}
        } ,
        pl : {
            'nationality' : {'Polska':'polski/a', 'Niemcy':'niemiecki/a', 'Stany Zjednoczone':'amerykański/a', 'Francja':'francuski/a',
                'Włochy':'włoski/a', 'Wielka Brytania':'brytyjski/a', 'Brazylia':'brazylijski/a', 'Norwegia':'norweski/a', 'Austria':'austriacki/a',
                'Holandia':'holenderski/a', 'Kanada':'kanadyjski/a', 'Szwajcaria':'szwajcarski/a', 'Indie':'indyjski/a', 'Argentyna':'argentyński/a',
                'Szwecja':'szwedzki/a', 'Hiszpania':'hiszpański/a', 'Belgia':'belgijski/a', 'Australia':'australijski/a', 'Japonia':'japoński/a',
                'Nowa Zelandia':'nowozelandzki/a', 'Meksyk':'meksykański/a', 'Portugalia':'portugalski/a', 'Rosja':'rosyjski/a', 'Grecja':'grecki/a',
                'Republika Południowej Afryki':'południowoafrykański/a', 'Turcja':'turecki/a', 'Czechy':'czeski/a', 'Finlandia':'fiński/a',
                'Indonezja':'indonezyjski/a', 'Węgry':'węgierski/a', 'Chile':'chilijski/a', 'Dania':'duński/a', 'Malezja':'malezyjski/a',
                'Kuba':'kubański/a', 'Korea Południowa':'południowokoreański/a', 'Iran':'irański/a', 'Irlandia':'irlandzki/a', 'Rumunia':'rumuński/a',
                'Tajlandia':'tajlandzki/a', 'Ukraina':'ukraiński/a', 'Luksemburg':'luksemburski/a', 'Estonia':'estoński/a', 'Starożytny Rzym':'rzymski/a',
                'Serbia':'serbski/a', 'Słowacja':'słowacki/a', 'Izrael':'izraelski/a', 'Związek Socjalistycznych Republik Radzieckich':'sowiecki/a',
                'Paragwaj':'paragwajski/a', 'Chorwacja':'chorwacki/a', 'Urugwaj':'urugwajski/a', 'Bułgaria':'bułgarski/a', 'Nigeria':'nigeryjski/a',
                'Łotwa':'łotewski/a', 'Haiti':'haitański/a', 'Egipt':'egipski/a', 'Armenia':'armeński/a,', 'Wybrzeże Kości Słoniowej':'iworyjski/a',
                'Kolumbia':'kolumbijski/a', 'Filipiny':'filipiński/a', 'Litwa':'litewski/a', 'Słowenia':'słoweński/a', 'Islandia':'islandzki/a',
                'Białoruś':'białoruski/a', 'Jamajka':'jamajski/a', 'Wenezuela':'wenezuelski/a', 'Gruzja':'gruziński/a', 'Kostaryka':'kostarykański/a',
                'Maroko':'marokański/a', 'Tunezja':'tunezyjski/a', 'Jugosławia':'jugosłowiański/a', 'Nepal':'nepalski/a', 'Albania':'albański/a',
                'Algieria':'algierski/a', 'Cesarstwo Bizantyńskie':'bizantyński/a', 'Czechosłowacja':'czechosłowacki/a', 'Irak':'iracki/a',
                'Somalia':'somalijski/a', 'Azerbejdżan':'azerbejdżański/a', 'Kazachstan':'kazachski/a', 'Senegal':'senegalski/a', 'Ghana':'ghański/a',
                'Malta':'maltański/a', 'Cypr':'cypryjski/a', 'Kamerun':'kameruński/a', 'Ekwador':'ekwadorski/a', 'Boliwia':'boliwijski/a',
                'Kenia':'kenijski/a', 'Liban':'libański/a', 'Pakistan':'pakistański/a', 'Peru':'peruwiański/a', 'Afganistan':'afgański/a',
                'Syria':'syryjski/a', 'Czarnogóra':'czarnogórski/a', 'Macedonia':'macedoński/a'}
        }
    } ,

    getStockString : function ( k , lang ) {
        if ( undefined !== this.stockStrings[k] ) {
            if ( undefined !== this.stockStrings[k][lang] ) return this.stockStrings[k][lang];
            return this.stockStrings[k]['en'];
        }
        return k;
    } ,

    getModifierString : function ( t , k , lang ) {
        if ( this.modifierStrings[lang] === undefined || this.modifierStrings[lang][k] === undefined ) {
            return t;
        }

        var m = t.match ( /^(<a.+>)(.+)(<\/a>)/ );
        if ( null === m ) m = [ '' , '' , t , '' ];
        var k2 = m[2];

        if ( this.modifierStrings[lang][k][k2] === undefined ) return t;
        return m[1] + this.modifierStrings[lang][k][k2] + m[3];
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
                if ( word.toLowerCase() == 'acteur' ) return 'actrice';
                if ( word.toLowerCase() == 'être humain' ) return 'personne';
            }
        } else if ( lang == 'de' ) {
            if ( hints.is_female ) {
                if ( hints.occupation ) {
                    word += 'in';
                }
            }
        }
        return word;
    } ,

    wikiUrlencode : function ( s ) {
        return escape ( s.replace(/ /g,'_') );
    } ,

    getOrdinal : function(n) {
        var s=["th","st","nd","rd"],
            v=n%100;
        return n+(s[(v-20)%10]||s[v]||s[0]);
    } ,

    listWords : function ( olist , hints , lang ) {
        var self = this;
        var last, count;
        var list = [];
        olist.forEach( function(v) { list.push(v); });
        if ( hints !== undefined ) {
            for (count = 0; count < list.length; count++) {
                list[count] = self.modifyWord ( list[count] , hints , lang );
            }
        }
        if ( lang == 'en' ) {
            if ( list.length == 1 ) return list[0];
            if ( list.length == 2 ) return list[0] + ' and ' + list[1];
            last = list.pop();
            return list.join ( ', ' ) + ', and ' + last;
        } else if ( lang == 'de' ) {
            if ( list.length == 1 ) return list[0];
            if ( list.length == 2 ) return list[0] + ' und ' + list[1];
            last = list.pop();
            return list.join ( ', ' ) + ' und ' + last;
        } else if ( lang == 'fr' ) {
            if ( list.length == 1 ) return list[0];
            if ( list.length == 2 ) return list[0] + ' et ' + list[1];
            last = list.pop();
            return list.join ( ', ' ) + ' et ' + last;
        } else if ( lang == 'nl' ) {
            if ( list.length == 1 ) return list[0];
            if ( list.length == 2 ) return list[0] + ' en ' + list[1];
            last = list.pop();
            return list.join ( ', ' ) + ' en ' + last;
        } else if ( lang == 'vi' ) {
            if ( list.length == 1 ) return list[0];
            if ( list.length == 2 ) return list[0] + ' và ' + list[1];
            last = list.pop();
            return list.join ( ', ' ) + ', và ' + last;
        } else return list.join ( ', ' );
    } ,

    ucFirst : function ( s ) {
        return s.substr(0,1).toUpperCase() + s.substr(1,s.length);
    } ,

    getNationalityFromCountry : function ( country , claims , hints ) {
        if ( hints === undefined ) hints = {};
        if ( hints.lang == 'de' ) {
            var n = this.getModifierString ( country , 'nationality' , hints.lang );
            if ( this.modifierStrings[hints.lang]['nationality'][country] === undefined ) return n;
            var is_female = this.hasPQ ( claims , P.sex , Q.female );
            if ( hints.not_last ) n += '';
            else if ( is_female ) n += 'e';
            else n += 'er';
            return n;
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

    getCountryOfOrigin : function ( claims , opt ) {
        var self = this;
        var h2 = '';
        var tmp = self.getP(claims, P.nationality);
        if (tmp.length == 0) {
            tmp = self.getP(claims, P.country_of_origin);
        }
        if (tmp.length == 0) {
            tmp = self.getP(claims, P.country);
        }
        var i, s, numCountries = 0;
        for (i = 0; i < tmp.length; i++) {
            s = self.getNationalityFromCountry ( tmp[i].qLabel , claims , { lang:opt.lang , not_last:(i+1!=tmp.length) } );
            numCountries++;
            if ( i == 0 ) h2 = s;
            else {
                h2 += '-' + s.toLowerCase(); // Multi-national
            }
        }
        if (numCountries > 2) { h2 = ''; }
        return h2;
    },

    isDisambig : function ( claims ) {
        return ( this.hasPQ ( claims, P.instance_of, Q.disambiguation_page ) );
    } ,

    getTargetQNum : function ( claim ) {
        if ( claim === undefined || claim.mainsnak === undefined || claim.mainsnak.datavalue === undefined
            || claim.mainsnak.datavalue.value === undefined || claim.mainsnak.datavalue.value['entity-type'] != 'item'
            || claim.mainsnak.datavalue.value['numeric-id'] === undefined ) {
            return undefined;
        }
        return claim.mainsnak.datavalue.value['numeric-id'];
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
            opt = {};
        }
        var self = this;
        var wordList = [];
        var i, j, lang;
        if ( typeof lang == 'undefined' && typeof opt.lang != 'undefined' ) lang = opt.lang;
        if ( typeof lang == 'undefined' && typeof opt.o != 'undefined' ) lang = opt.o.lang;
        if ( typeof lang == 'undefined' && typeof opt.hints != 'undefined' && typeof opt.hints.o != 'undefined' ) lang = opt.hints.o.lang;
        if ( typeof lang == 'undefined' ) self.logd ( "NO LANG" );
        var finalLabel;

        var claimsArray = [], claimPosition;

        if (undefined !== opt.prefer_refs) {
            // Prefer claims that have references...
            props.forEach(function (prop) {
                (claims[self.p_prefix + prop] || []).forEach(function (claim) {
                    for (claimPosition = 0; claimPosition < claimsArray.length; claimPosition++) {
                        if (self.getClaimReferences(claim).length > self.getClaimReferences(claimsArray[claimPosition]).length) {
                            break;
                        }
                    }
                    claimsArray.splice(claimPosition, 0, claim);
                });
            });
        } else {
            props.forEach(function (prop) {
                (claims[self.p_prefix + prop] || []).forEach(function (claim) {
                    claimsArray.push(claim);
                });
            });
        }

        // Add ordinal number if it exists, and verify uniqueness
        claimsArray.forEach( function( claim ) {
            finalLabel = '';

            // Does the claim have an ordinal?
            var ordVal = self.getQualifierValue(claim, P.series_ordinal);
            if (ordVal !== null) {
                finalLabel += self.getOrdinal(ordVal) + ' ';
            }

            finalLabel += claim.qLabel;

            // Make sure the label is unique among the labels we already have, and is nonempty
            if (wordList.indexOf(finalLabel) == -1 && finalLabel.length > 0) {
                wordList.push(finalLabel);
            }
        } );

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
            if ( undefined !== opt.prefix && h.length > 0 ) h[h.length-1] += opt.prefix;
            var s = self.listWords ( wordList , opt.hints , lang );
            if ( undefined !== opt.txt_key ) s = self.getStockString(opt.txt_key, lang) + ' ' + s;
            h.push ( s );
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
        p = this.p_prefix+p;
        var ret = null;
        if ( undefined === claims[p] ) return ret;
        claims[p].forEach( function ( v ) {
            if ( q != self.getTargetQNum(v) ) return;
            ret = v;
        } );
        return ret;
    } ,

    addItemsFromClaims : function ( claims , pArray , items ) {
        var self = this;
        pArray.forEach( function(p) {
            if ( undefined === claims[self.p_prefix+p] ) return;
            claims[self.p_prefix+p].forEach( function ( claim ) {
                items.push( claim );
            });
        });
    } ,

    getPValues : function ( claims , p ) { // p numerical
        var self = this;
        p = self.p_prefix+p;
        var ret = [];
        if ( undefined === claims[p] ) return ret;
        claims[p].forEach( function ( v ) {
            if ( undefined === v.mainsnak || undefined === v.mainsnak.datavalue
                || undefined === v.mainsnak.datavalue.value || undefined === v.mainsnak.datavalue.type ) {
                return ret;
            }

            self.logd(">>> " + JSON.stringify(v.mainsnak.datavalue));

            var val = '';
            if (v.mainsnak.datavalue.type == 'time') {
                if ( undefined === v.mainsnak.datavalue.value['time'] ) return;
                val = v.mainsnak.datavalue.value['time'].toString();
            } else if (v.mainsnak.datavalue.type == 'quantity') {
                if ( undefined === v.mainsnak.datavalue.value['amount'] ) return;
                val = v.mainsnak.datavalue.value['amount'].toString();
            } else if (v.mainsnak.datavalue.type == 'string') {
                val = v.mainsnak.datavalue.value.toString();
            }
            if (val !== null && val.length > 1 && val.substring(0,1) === "+") {
                val = val.substring(1);
            }
            ret.push(val);
        } );
        return ret;
    } ,

    getFirstPValue : function ( claims , p ) { // p numerical
        var self = this;
        var vals = self.getPValues(claims, p);
        var ret = '';
        if (vals.length > 0) {
            ret = vals[0];
        }
        return ret;
    } ,

    getQualifier : function ( claim, qualifier ) {
        var self = this;
        if ( undefined === claim.qualifiers || undefined === claim.qualifiers[self.p_prefix+qualifier] ) {
            return null;
        }
        return claim.qualifiers[self.p_prefix+qualifier];
    } ,

    getQualifierValue : function ( claim, qualifier ) {
        var self = this;
        var ret = null;
        var qual = self.getQualifier(claim, qualifier);
        if (qual === null) return ret;
        qual.forEach(function (item) {
            if (undefined === item.datavalue || undefined === item.datavalue.value) {
                return ret;
            }
            ret = item.datavalue.value;
        });
        return ret;
    } ,

    getClaimReferences : function ( claim ) {
        var ret = [];
        if ( undefined === claim.references ) return ret;
        ret = claim.references;
        return ret;
    } ,

    getYear : function ( claims , p , lang ) { // p numerical
        var self = this;
        var ret = '';
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
        var self = this;

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
                        for (var v2 in v.labels) {
                            curlang = v2;
                        }
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

    getDescription : function ( title , opt, callback ) {
        var self = this;
        self.logd("Fetching claims for " + title + "...");
        if (title.length == 0) {
            callback(null, '');
            return;
        }
        if (title.length > 1 && title.toUpperCase().substring(0, 1) == 'Q' && !isNaN(title.substring(1))) {
            title = title.toUpperCase();
            opt.q = title;
            wd.getItemBatch([title], function () {
                self.logd("Back from fetching.");
                self.performDescription(title, opt, callback);
            });
        } else {
            wd.getItemFromTitle(title, function ( qarray ) {
                self.logd("Back from fetching.");
                if (qarray.length == 0) {
                    callback(null, '');
                    return;
                }
                var q = qarray[0];
                opt.q = q;
                if (title.toLowerCase() == 'love') {
                    callback(q, 'Battlefield');
                    return;
                }
                self.performDescription(q, opt, callback);
            });
        }
    } ,

    performDescription : function ( q , opt, callback ) {
        var self = this;
        if (undefined === wd.items[q]) {
            callback(q, "");
            return;
        }
        var claims = wd.items[q].raw.claims || [];
        self.initClaimLabels(claims);

        for (var i = 0; i < describeHandlers.length; i++) {
            if (describeHandlers[i].matchType(self, claims)) {
                describeHandlers[i].describe(self, claims, opt, function (text) {

                    text = self.ucFirst(text).replace(/  +/g, ' ');
                    text = self.generalTransforms(text);
                    callback(q, text);

                    // TODO: remove when not debugging:
                    // un-define this Q item
                    wd.clear();

                });
                break;
            }
        }
    } ,

    fin:''
};

exports.ad = wd_auto_desc;
exports.wd = wd;

},{"./desc_band":3,"./desc_book":4,"./desc_city":5,"./desc_element":6,"./desc_film":7,"./desc_generic":8,"./desc_person":9,"./desc_taxon":10,"./wd_properties":11,"./wikidata":12}],3:[function(require,module,exports){
'use strict';

var propertiesList = require('./wd_properties').properties;
var P = propertiesList.P;
var Q = propertiesList.Q;

function matchType ( ad, claims ) {
    return ( ad.hasPQ( claims , P.instance_of, Q.band) || ad.hasPQ( claims , P.instance_of, Q.rock_band) );
}

function describe ( ad, claims, opt, callback ) {
    ad.logd("Describing band...");
    var load_items = [] ;
    ad.addItemsFromClaims ( claims , [ P.instance_of, P.genre, P.country_of_origin, P.country, P.nationality ] , load_items );

    ad.labelItems ( load_items , function () {
        var h = [];
        var h2;

        h2 = ad.getCountryOfOrigin(claims, opt);
        if ( h2 != '' ) h.push ( h2 ) ;

        if (ad.hasP(claims, P.genre)) {
            ad.add2desc ( h , claims , [ P.genre ] , { o:opt, max_count:1 } ) ;
        }

        ad.add2desc ( h , claims , [ P.instance_of ] , { o:opt, max_count:1 } ) ;

        // Fallback
        if ( h.length == 0 ) h.push ( ad.getStockString('film', opt.lang) ) ;
        callback( h.join(' ') );
    }, opt ) ;
}

exports.matchType = matchType;
exports.describe = describe;

},{"./wd_properties":11}],4:[function(require,module,exports){
'use strict';

var propertiesList = require('./wd_properties').properties;
var P = propertiesList.P;
var Q = propertiesList.Q;

function matchType ( ad, claims ) {
    return ( ad.hasPQ( claims , P.instance_of, Q.book) || ad.hasPQ( claims , P.instance_of, Q.literary_work));
}

function describe ( ad, claims, opt, callback ) {
    ad.logd("Describing publication...");
    var load_items = [] ;
    ad.addItemsFromClaims ( claims , [ P.instance_of, P.publication_date, P.author, P.genre ], load_items );

    ad.labelItems ( load_items , function () {
        var h = [];

        var pubdate = ad.getYear ( claims , P.publication_date , opt.lang ) ;
        if ( pubdate != '' ) h.push ( pubdate ) ;

        if (ad.hasP(claims, P.genre)) {
            ad.add2desc ( h , claims , [ P.genre ] , { o:opt, max_count:1 } ) ;
        } else {
            ad.add2desc ( h , claims , [ P.instance_of ] , { o:opt, max_count:1 } ) ;
        }

        ad.add2desc ( h , claims , [ P.author ] , { txt_key:'by', o:opt } ) ;

        // Fallback
        if ( h.length == 0 ) h.push ( ad.getStockString('book', opt.lang) ) ;
        callback( h.join(' ') );
    }, opt ) ;
}

exports.matchType = matchType;
exports.describe = describe;

},{"./wd_properties":11}],5:[function(require,module,exports){
'use strict';

var propertiesList = require('./wd_properties').properties;
var P = propertiesList.P;
var Q = propertiesList.Q;

function matchType ( ad, claims ) {
    return ( ad.hasPQ( claims , P.instance_of, Q.city) || ad.hasPQ( claims , P.instance_of, Q.capital) );
}

function describe ( ad, claims, opt, callback ) {
    ad.logd("Describing city...");
    var load_items = [] ;
    ad.addItemsFromClaims ( claims , [ P.part_of, P.subclass_of, P.instance_of, P.country, P.located_in_the_administrative_territorial_entity, P.capital_of, P.named_after ] , load_items ) ;

    ad.labelItems ( load_items , function () {
        var h = [];
        var h2;
        var countryCapital = false;

        if (ad.hasP(claims, P.capital_of)) {
            var countryArr = ad.getP(claims, P.country);
            if (countryArr.length > 0) {
                var country = countryArr[0];
                ad.getP(claims, P.capital_of).forEach(function (v) {
                    if (country.qLabel === v.qLabel) {
                        h.push(ad.getStockString('capital of', opt.lang));
                        h.push(ad.getStockString(country.qLabel, opt.lang));
                        countryCapital = true;
                    }
                });
            }
        }

        if (!countryCapital) {
            // Instance/subclass/etc
            ad.add2desc(h, claims, [P.subclass_of, P.instance_of], { o: opt, max_count:1 });

            // Location
            h2 = [];
            ad.getP(claims, P.located_in_the_administrative_territorial_entity).forEach(function (v) {
                h2.push(v.qLabel);
            });
            var sep = ' / ';
            var h3 = [];
            ad.getP(claims, P.country).forEach(function (v) {
                h3.push(v.qLabel);
            });
            if (h.length == 0 && ( h2.length > 0 || h3.length > 0 )) h.push(ad.getStockString('location', opt.lang));
            if (h2.length > 0 && h3.length > 0) h.push(ad.getStockString('in', opt.lang) + ' ' + h2.join(sep) + ", " + h3.join(sep));
            else if (h2.length > 0) h.push(ad.getStockString('in', opt.lang) + ' ' + h2.join(sep));
            else if (h3.length > 0) h.push(ad.getStockString('in', opt.lang) + ' ' + h3.join(sep));

            ad.add2desc ( h , claims , [ P.capital_of ] , { prefix:',' , txt_key:'capital of', o:opt, max_count:1 } ) ;
        }

        ad.add2desc ( h , claims , [ P.part_of ] , { prefix:',' , txt_key:'part of',o:opt } ) ;
        ad.add2desc ( h , claims , [ P.named_after ] , { prefix:',' , txt_key:'named after',o:opt } ) ;

        // Fallback
        if ( h.length == 0 ) {
            h = ad.getStockString('city', opt.lang);
        }
        callback( h.join( ' ' ) );
    } , opt ) ;
}

exports.matchType = matchType;
exports.describe = describe;

},{"./wd_properties":11}],6:[function(require,module,exports){
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

},{"./wd_properties":11}],7:[function(require,module,exports){
'use strict';

var propertiesList = require('./wd_properties').properties;
var P = propertiesList.P;
var Q = propertiesList.Q;

function matchType ( ad, claims ) {
    return ( ad.hasPQ( claims , P.instance_of, Q.film)
    || ad.hasPQ( claims , P.instance_of, Q.television_program)
    || ad.hasPQ( claims , P.instance_of, Q.television_series)
    || ad.hasPQ( claims , P.instance_of, Q.television_film));
}

function describe ( ad, claims, opt, callback ) {
    ad.logd("Describing film...");
    var load_items = [] ;
    ad.addItemsFromClaims ( claims , [ P.instance_of, P.publication_date, P.director, P.producer, P.genre,
        P.country_of_origin, P.country, P.nationality, P.cast_member ] , load_items );

    ad.labelItems ( load_items , function () {
        var h = [];
        var h2;

        var pubdate = ad.getYear ( claims , P.publication_date , opt.lang ) ;
        if ( pubdate != '' ) h.push ( pubdate ) ;

        h2 = ad.getCountryOfOrigin(claims, opt);
        if ( h2 != '' ) h.push ( h2 ) ;

        if (ad.hasP(claims, P.genre) && ad.hasPQ( claims , P.instance_of, Q.film)) {
            ad.add2desc ( h , claims , [ P.genre ] , { o:opt, max_count:1 } ) ;
        } else {
            ad.add2desc ( h , claims , [ P.instance_of ] , { o:opt, max_count:1 } ) ;
        }

        ad.add2desc ( h , claims , [ P.director ] , { txt_key:'directed by', o:opt } ) ;
        ad.add2desc ( h , claims , [ P.cast_member ] , { prefix:',', txt_key:'starring', o:opt, max_count:2 } ) ;

        // Fallback
        if ( h.length == 0 ) h.push ( ad.getStockString('film', opt.lang) ) ;
        callback( h.join(' ') );
    }, opt ) ;
}

exports.matchType = matchType;
exports.describe = describe;

},{"./wd_properties":11}],8:[function(require,module,exports){
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
        P.field_of_this_profession, P.constellation, P.from_fictional_universe ] , load_items ) ;

    ad.labelItems ( load_items , function () {
        var h = [];
        var h2;

        // Date
        var pubdate = ad.getYear ( claims , P.publication_date , opt.lang ) ;
        if ( pubdate != '' ) h.push ( pubdate ) ;

        // Nationality / country of origin
        //h2 = ad.getNationality(claims, opt);
        //if ( h2 != '' ) h.push ( h2 ) ;

        // Instance/subclass/etc
        ad.add2desc ( h , claims , [ P.instance_of, P.subclass_of, P.taxon_rank ] , { o:opt } ) ;

        // Location
        h2 = [] ;
        ad.getP(claims, P.located_in_the_administrative_territorial_entity).forEach( function ( v ) {
            h2.push (v.qLabel ) ;
        } );
        var sep = ' / ' ;
        var h3 = [] ;
        ad.getP(claims, P.country).forEach( function ( v ) {
            h3.push (v.qLabel ) ;
        } );
        if ( h.length == 0 && ( h2.length > 0 || h3.length > 0 ) ) h.push ( ad.getStockString('location', opt.lang) ) ;
        if ( h2.length > 0 && h3.length > 0 ) h.push ( ad.getStockString('in', opt.lang) + ' ' + h2.join(sep) + ", " + h3.join(sep) ) ;
        else if ( h2.length > 0 ) h.push ( ad.getStockString('in', opt.lang) + ' ' + h2.join(sep) ) ;
        else if ( h3.length > 0 ) h.push ( ad.getStockString('in', opt.lang) + ' ' + h3.join(sep) ) ;

        ad.add2desc ( h , claims , [ P.from_fictional_universe ] , { txt_key:'from',o:opt } ) ;
        ad.add2desc ( h , claims , [ P.creator, P.composer, P.director, P.author ] , { txt_key:'by',o:opt } ) ;
        ad.add2desc ( h , claims , [ P.performer ] , { txt_key:'performed by',o:opt } ) ;
        ad.add2desc ( h , claims , [ P.discoverer_or_inventor ] , { txt_key:'discovered by',o:opt } ) ;
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
        ad.getP(claims, P.headquarters_location).forEach( function ( v ) {
            h2.push (v.qLabel) ;
        } );
        h3 = [];
        ad.getP(claims, P.country_of_origin).forEach( function ( v ) {
            h3.push (v.qLabel) ;
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

},{"./wd_properties":11}],9:[function(require,module,exports){
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
    ad.addItemsFromClaims ( claims , [ P.occupation, P.position_held, P.nationality, P.country_of_origin, P.country, P.award_received, P.instance_of, P.father, P.mother, P.spouse, P.member_of ] , load_items );

    var is_male = ad.hasPQ ( claims , P.sex , Q.male ) ;
    var is_female = ad.hasPQ ( claims , P.sex , Q.female ) ;

    ad.labelItems ( load_items , function () {
        var h = [] ;

        // Nationality
        var h2 = ad.getCountryOfOrigin(claims, opt);
        if ( h2 != '' ) h.push ( h2 ) ;

        // Occupation
        var ol = h.length ;
        ad.add2desc ( h , claims , [ P.occupation ] , { hints:{is_male:is_male,is_female:is_female,occupation:true}, o:opt, max_count:3, prefer_refs:true } ) ;
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

        //ad.add2desc ( h , claims , [ P.member_of ] , { prefix:';', txt_key:'member of', o:opt } ) ;
        //ad.add2desc ( h , claims , [ P.father, P.mother ] , { prefix:';', txt_key:'child of', o:opt } ) ;
        //ad.add2desc ( h , claims , [ P.spouse ] , { prefix:';', txt_key:'spouse of', o:opt } ) ;

        if ( h.length == 0 ) h.push ( ad.getStockString('person', opt.lang) ) ;
        callback( h.join(' ') );
    } , opt ) ;

}

exports.matchType = matchType;
exports.describe = describe;

},{"./wd_properties":11}],10:[function(require,module,exports){
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

},{"./wd_properties":11,"./wikidata":12}],11:[function(require,module,exports){
'use strict';

var properties = {

    Q: {
        human : 5,
        male : 6581097,
        female : 6581072,
        person : 215627,

        city: 515,
        capital: 5119,

        book: 571,
        literary_work: 7725634,

        film: 11424,
        television_program: 15416,
        television_series: 5398426,
        television_film: 506240,

        chemical_element: 11344,
        taxon: 16521,
        phylum: 38348,

        actor: 33999,
        film_actor: 10800557,
        singer: 177220,
        politician: 82955,
        writer: 36180,
        businessperson: 43845,

        band: 215380,
        rock_band: 5741069,

        animal: 729,
        hominidae: 635162,
        reptile: 10811,
        mammal: 7377,
        marsupial: 25336,
        rodentia: 10850,
        dinosaur: 430,
        osteichthyes: 27207,
        chondrichthyes: 25371,
        felidae: 25265,
        bird: 5113,
        insect: 1390,
        plant: 756,
        fungus: 764,
        mollusca: 25326,

        geographical_feature : 618123,
        category_page : 4167836,
        template_page : 11266439,
        list_page : 13406463,
        disambiguation_page : 4167410
    },

    P: {
        custom1: 10000000,
        custom2: 10000001,
        custom3: 10000002,

        head_of_government: 6,
        brother: 7,
        sister: 9,
        video: 10,
        highway_marker: 14,
        road_map: 15,
        highway_system: 16,
        country: 17,
        image: 18,
        place_of_birth: 19,
        place_of_death: 20,
        sex: 21,
        father: 22,
        mother: 25,
        spouse: 26,
        nationality: 27,
        uncle: 29,
        continent: 30,
        instance_of: 31,
        head_of_state: 35,
        capital: 36,
        official_language: 37,
        currency: 38,
        position_held: 39,
        child: 40,
        flag_image: 41,
        stepfather: 43,
        stepmother: 44,
        grandparent: 45,
        shares_border_with: 47,
        author: 50,
        audio: 51,
        noble_family: 53,
        member_of_sports_team: 54,
        director: 57,
        screenwriter: 58,
        constellation: 59,
        is_a: 60,
        discoverer_or_inventor: 61,
        site_of_astronomical_discovery: 65,
        ancestral_home: 66,
        educated_at: 69,
        top_level_domain: 78,
        connecting_line: 81,
        architect: 84,
        anthem: 85,
        composer: 86,
        librettist: 87,
        commissioned_by: 88,
        sexual_orientation: 91,
        main_regulatory_text: 92,
        coat_of_arms_image: 94,
        noble_title: 97,
        editor: 98,
        field_of_work: 101,
        member_of_political_party: 102,
        native_language: 103,
        taxon_rank: 105,
        occupation: 106,
        gnd: 107,
        employer: 108,
        signature: 109,
        illustrator: 110,
        measured_physical_quantity: 111,
        founder: 112,
        airline_hub: 113,
        airline_alliance: 114,
        home_venue: 115,
        chemical_structure: 117,
        league: 118,
        place_of_burial: 119,
        item_operated: 121,
        basic_form_of_government: 122,
        publisher: 123,
        maintained_by: 126,
        owned_by: 127,
        regulates_molecular_biology: 128,
        physically_interacts_with: 129,
        located_in_the_administrative_territorial_entity: 131,
        has_dialect: 134,
        movement: 135,
        genre: 136,
        operator: 137,
        named_after: 138,
        aunt: 139,
        religion: 140,
        IUCN_conservation_status: 141,
        imported_from: 143,
        based_on: 144,
        architectural_style: 149,
        contains_administrative_territorial_entity: 150,
        logo_image: 154,
        follows: 155,
        followed_by: 156,
        killed_by: 157,
        seal_image: 158,
        headquarters_location: 159,
        cast_member: 161,
        producer: 162,
        flag: 163,
        award_received: 166,
        structure_replaced_by: 167,
        chief_executive_officer: 169,
        creator: 170,
        parent_taxon: 171,
        ethnic_group: 172,
        performer: 175,
        manufacturer: 176,
        crosses: 177,
        developer: 178,
        series: 179,
        depicts: 180,
        taxon_range_map_image: 181,
        endemic_to: 183,
        doctoral_advisor: 184,
        doctoral_student: 185,
        material_used: 186,
        location_of_discovery: 189,
        sister_city: 190,
        main_building_contractor: 193,
        legislative_body: 194,
        collection: 195,
        minor_planet_group: 196,
        adjacent_station: 197,
        business_division: 199,
        lake_inflows: 200,
        lake_outflow: 201,
        basin_country: 205,
        located_next_to_body_of_water: 206,
        bathymetry_image: 207,
        executive_body: 208,
        highest_judicial_authority: 209,
        party_chief_representative: 210,
        ISBN_13: 212,
        ISNI: 213,
        VIAF_identifier: 214,
        spectral_class: 215,
        inventory_number: 217,
        ISO_639_1_code: 218,
        ISO_639_2_code: 219,
        ISO_639_3_code: 220,
        ISO_639_6_code: 221,
        galaxy_morphological_type: 223,
        taxon_name: 225,
        GND_identifier: 227,
        IATA_airline_designator: 229,
        ICAO_airline_designator: 230,
        CAS_registry_number: 231,
        EINECS_number: 232,
        canonical_SMILES: 233,
        InChI: 234,
        InChIKey: 235,
        ISSN: 236,
        coat_of_arms: 237,
        IATA_airport_code: 238,
        ICAO_airport_code: 239,
        FAA_airport_code: 240,
        military_branch: 241,
        locator_map_image: 242,
        OCLC_control_number: 243,
        LCAuth_identifier: 244,
        ULAN_identifier: 245,
        element_symbol: 246,
        COSPAR_ID: 247,
        stated_in: 248,
        ticker_symbol: 249,
        official_residence: 263,
        record_label: 264,
        ATC_code: 267,
        BnF_identifier: 268,
        SUDOC_authorities: 269,
        CALIS: 270,
        CiNii_author_identifier: 271,
        production_company: 272,
        chemical_formula: 274,
        license: 275,
        location: 276,
        programming_language: 277,
        GOST_775_97_code: 278,
        subclass_of: 279,
        postal_code: 281,
        writing_system: 282,
        head_coach: 286,
        designer: 287,
        vessel_class: 289,
        place_of_publication: 291,
        station_code: 296,
        ISO_3166_1_alpha_2_code: 297,
        ISO_3166_1_alpha_3_code: 298,
        ISO_3166_1_numeric_code: 299,
        ISO_3166_2_code: 300,
        categorys_main_topic: 301,
        EE_breed_number: 303,
        page: 304,
        IETF_language_tag: 305,
        operating_system: 306,
        director_of_photography: 344,
        IMDb_identifier: 345,
        Joconde_ID: 347,
        software_version: 348,
        NDL_identifier: 349,
        RKDimages: 350,
        Entrez_Gene_ID: 351,
        UniProt_ID: 352,
        gene_symbol: 353,
        HGNC_ID: 354,
        subsidiaries: 355,
        DOI: 356,
        OBSOLETE_title_use_P1476_title: 357,
        discography: 358,
        Rijksmonument_identifier: 359,
        is_a_list_of: 360,
        part_of: 361,
        original_language_of_work: 364,
        use: 366,
        astronomic_symbol_image: 367,
        Sandbox_CommonsMediaFile: 368,
        Sandbox_String: 370,
        presenter: 371,
        Commons_category: 373,
        INSEE_municipality_code: 374,
        space_launch_vehicle: 375,
        located_on_astronomical_body: 376,
        SCN: 377,
        Mérimée_identifier: 380,
        PCP_reference_number: 381,
        CBS_municipality_code: 382,
        OBSOLETE_quote_use_P1683: 387,
        edition_number: 393,
        licence_plate_code: 395,
        SBN_identifier: 396,
        astronomical_body: 397,
        child_astronomical_body: 398,
        companion_of: 399,
        platform: 400,
        OpenStreetMap_Relation_identifier: 402,
        mouth_of_the_watercourse: 403,
        game_mode: 404,
        taxon_author: 405,
        soundtrack_album: 406,
        language_of_work_or_name: 407,
        software_engine: 408,
        NLA_Australia_identifier: 409,
        military_rank: 410,
        canonization_status: 411,
        voice_type: 412,
        position_played_on_team: 413,
        stock_exchange: 414,
        radio_format: 415,
        quantity_symbol: 416,
        patron_saint: 417,
        seal_description: 418,
        located_in_time_zone: 421,
        shooting_handedness: 423,
        Wikimedia_language_code: 424,
        field_of_this_profession: 425,
        aircraft_registration: 426,
        taxonomic_type: 427,
        botanist_author_abbreviation: 428,
        dantai_code: 429,
        callsign_of_airline: 432,
        issue: 433,
        MusicBrainz_artist_ID: 434,
        MusicBrainz_work_ID: 435,
        MusicBrainz_release_group_ID: 436,
        distribution: 437,
        OBSOLETE_inscription_use_P1684: 438,
        German_municipality_key: 439,
        German_district_key: 440,
        China_administrative_division_code: 442,
        pronunciation_audio: 443,
        review_score: 444,
        score_by: 447,
        location_of_spacecraft_launch: 448,
        original_network: 449,
        astronaut_mission: 450,
        cohabitant: 451,
        industry: 452,
        character_role: 453,
        Structurae_ID_structure: 454,
        Emporis_ID: 455,
        foundational_text: 457,
        IMO_ship_number: 458,
        determination_method: 459,
        said_to_be_the_same_as: 460,
        opposite_of: 461,
        color: 462,
        member_of: 463,
        NOR: 464,
        sRGB_color_hex_triplet: 465,
        occupant: 466,
        legislated_by: 467,
        dan_kyu_rank: 468,
        lakes_on_river: 469,
        Eight_Banner_register: 470,
        local_dialing_code: 473,
        country_calling_code: 474,
        CELEX_number: 476,
        Canadian_Register_of_Historic_Places_identifier: 477,
        volume: 478,
        input_device: 479,
        FilmAffinity_identifier: 480,
        Palissy_identifier: 481,
        recorded_at: 483,
        IMA_Number_broad_sense: 484,
        archives_at: 485,
        MeSH_ID: 486,
        Unicode_character: 487,
        chairperson: 488,
        currency_symbol_description: 489,
        provisional_designation: 490,
        orbit_diagram: 491,
        OMIM_ID: 492,
        ICD_9: 493,
        ICD_10: 494,
        country_of_origin: 495,
        ORCID: 496,
        CBDB_ID: 497,
        ISO_4217_code: 498,
        exclave_of: 500,
        enclave_within: 501,
        HURDAT_identifier: 502,
        ISO_standard: 503,
        home_port: 504,
        general_manager: 505,
        ISO_15924_alpha_4_or_numeric_code: 506,
        Swedish_county_code: 507,
        BNCF_Thesaurus: 508,
        cause_of_death: 509,
        honorific_prefix: 511,
        academic_degree: 512,
        OBSOLETE_birth_name_use_P1477: 513,
        interleaves_with: 514,
        phase_of_matter: 515,
        powerplant: 516,
        interaction: 517,
        applies_to_part: 518,
        armament: 520,
        scheduled_service_destination: 521,
        type_of_orbit: 522,
        temporal_range_start: 523,
        temporal_range_end: 524,
        Swedish_municipality_code: 525,
        has_part: 527,
        catalog_code: 528,
        runway: 529,
        diplomatic_relation: 530,
        diplomatic_mission_sent: 531,
        port_of_registry: 532,
        target: 533,
        streak_color: 534,
        Find_a_Grave_grave_ID: 535,
        ATP_ID: 536,
        twinning: 537,
        fracturing: 538,
        Museofile: 539,
        office_contested: 541,
        officially_opened_by: 542,
        oath_made_by: 543,
        torch_lit_by: 545,
        docking_port: 546,
        commemorates: 547,
        version_type: 548,
        Mathematics_Genealogy_Project_identifier: 549,
        chivalric_order: 550,
        residence: 551,
        handedness: 552,
        website_account_on: 553,
        website_username: 554,
        doubles_record: 555,
        crystal_system: 556,
        DiseasesDB: 557,
        unit_symbol: 558,
        terminus: 559,
        direction: 560,
        NATO_reporting_name: 561,
        central_bank_issuer: 562,
        ICD_O: 563,
        singles_record: 564,
        crystal_habit: 565,
        basionym: 566,
        hangingwall: 567,
        footwall: 568,
        date_of_birth: 569,
        date_of_death: 570,
        inception: 571,
        date_of_taxon_name_publication: 574,
        time_of_discovery: 575,
        dissolved_or_abolished: 576,
        publication_date: 577,
        Sandbox_TimeValue: 578,
        IMA_status_and_or_rank: 579,
        start_time: 580,
        end_time: 582,
        point_in_time: 585,
        IPNI_author_ID: 586,
        MMSI: 587,
        coolant: 588,
        point_group: 589,
        GNIS_ID: 590,
        EC_number: 591,
        ChEMBL_ID: 592,
        HomoloGene_ID: 593,
        Ensembl_Gene_ID: 594,
        IUPHAR_ID: 595,
        WTA_ID: 597,
        commander_of: 598,
        ITF_ID: 599,
        Wine_AppDB_ID: 600,
        MedlinePlus_ID: 604,
        NUTS_code: 605,
        first_flight: 606,
        conflict: 607,
        exhibition_history: 608,
        terminus_location: 609,
        highest_point: 610,
        religious_order: 611,
        mother_house: 612,
        OS_grid_reference: 613,
        yard_number: 617,
        source_of_energy: 618,
        time_of_spacecraft_launch: 619,
        time_of_spacecraft_landing: 620,
        time_of_spacecraft_orbit_decay: 621,
        spacecraft_docking_undocking: 622,
        guidance_system: 624,
        coordinate_location: 625,
        Sandbox_GeoCoordinateValue: 626,
        IUCN_ID: 627,
        E_number: 628,
        edition_or_translation_of: 629,
        Paris_city_digital_code: 630,
        structural_engineer: 631,
        cultural_properties_of_Belarus_reference_number: 632,
        Répertoire_du_patrimoine_culturel_du_Québec_identifier: 633,
        captain: 634,
        ISTAT_ID: 635,
        route_of_administration: 636,
        RefSeq_Protein_ID: 637,
        PDB_ID: 638,
        RefSeq_RNA_ID: 639,
        Léonore_ID: 640,
        sport: 641,
        of: 642,
        genomic_start: 644,
        genomic_end: 645,
        Freebase_identifier: 646,
        drafted_by: 647,
        Open_Library_identifier: 648,
        NRHP_reference_number: 649,
        RKDartists: 650,
        Biografisch_Portaal_number: 651,
        UNII: 652,
        PubMed_Health: 653,
        direction_relative_to_location: 654,
        translator: 655,
        RefSeq: 656,
        RTECS_number: 657,
        tracklist: 658,
        GenLoc_assembly: 659,
        EC_classification: 660,
        ChemSpider_ID: 661,
        PubChem_ID_CID: 662,
        DSM_IV: 663,
        organizer: 664,
        KEGG_ID: 665,
        ICPC_2_ID: 667,
        GeneReviews_ID: 668,
        located_on_street: 669,
        street_number: 670,
        Mouse_Genome_Informatics_ID: 671,
        MeSH_Code: 672,
        eMedicine: 673,
        characters: 674,
        Google_Books_identifier: 675,
        lyrics_by: 676,
        ÚSOP_code: 677,
        incertae_sedis: 678,
        ZVG_number: 679,
        molecular_function: 680,
        cell_component: 681,
        biological_process: 682,
        ChEBI_ID: 683,
        ortholog: 684,
        NCBI_Taxonomy_ID: 685,
        Gene_Ontology_ID: 686,
        BHL_Page_ID: 687,
        encodes: 688,
        afflicts: 689,
        space_group: 690,
        NKC_identifier: 691,
        Gene_Atlas_Image: 692,
        cleavage: 693,
        replaced_synonym_for_nom_nov: 694,
        UN_number: 695,
        Neurolex_ID: 696,
        ex_taxon_author: 697,
        PubMed_ID: 698,
        Disease_Ontology_ID: 699,
        Kemler_ID: 700,
        Dodis: 701,
        encoded_by: 702,
        found_in_taxon: 703,
        Ensembl_Transcript_ID: 704,
        Ensembl_Protein_ID: 705,
        located_on_terrain_feature: 706,
        satellite_bus: 707,
        diocese: 708,
        Historic_Scotland_ID: 709,
        participant: 710,
        Strunz_8th_edition_series_ID: 711,
        Nickel_Strunz_9th_edition_updated_2009: 712,
        Nickel_Strunz_10th_pending_edition: 713,
        Dana_8th_edition: 714,
        Drugbank_ID: 715,
        JPL_Small_Body_Database_identifier: 716,
        Minor_Planet_Center_observatory_code: 717,
        Canmore_ID: 718,
        asteroid_spectral_type: 720,
        OKATO_identifier: 721,
        UIC_station_code: 722,
        DBNL_ID: 723,
        Internet_Archive_identifier: 724,
        voice_actor: 725,
        candidate: 726,
        Europeana_ID: 727,
        GHS_hazard_statement: 728,
        service_entry: 729,
        service_retirement: 730,
        Litholex_ID: 731,
        BGS_Lexicon_ID: 732,
        DINOloket: 733,
        family_name: 734,
        given_name: 735,
        cover_artist: 736,
        influenced_by: 737,
        influence_of: 738,
        ammunition: 739,
        location_of_formation: 740,
        playing_hand: 741,
        pseudonym: 742,
        asteroid_family: 744,
        Low_German_Bibliography_and_Biography_ID: 745,
        date_of_disappearance: 746,
        editions: 747,
        appointed_by: 748,
        parent_company: 749,
        distributor: 750,
        introduced_feature: 751,
        removed_feature: 756,
        World_Heritage_Site_id: 757,
        Kulturminne_identifier: 758,
        Alberta_Register_of_Historic_Places_identifier: 759,
        DPLA_ID: 760,
        VISS_ID: 761,
        Czech_cultural_heritage_ID_: 762,
        PEI_Register_of_Historic_Places_identifier: 763,
        OKTMO_identifier: 764,
        surface_played_on: 765,
        contributor: 767,
        electoral_district: 768,
        significant_drug_interaction: 769,
        cause_of_destruction: 770,
        Swiss_municipality_code: 771,
        INE_municipality_code: 772,
        ISO_3166_3: 773,
        FIPS_55_3_locations_in_the_US: 774,
        Swedish_urban_area_code: 775,
        Swedish_minor_urban_area_code: 776,
        Swedish_civil_parish_code_ATA_code: 777,
        Church_of_Sweden_parish_code: 778,
        Church_of_Sweden_Pastoratskod: 779,
        symptoms: 780,
        Sikart: 781,
        LAU: 782,
        hymenium_type: 783,
        mushroom_cap_shape: 784,
        hymenium_attachment: 785,
        stipe_character: 786,
        spore_print_color: 787,
        mushroom_ecological_type: 788,
        edibility: 789,
        approved_by: 790,
        ISIL_ID: 791,
        chapter: 792,
        significant_event: 793,
        as: 794,
        distance_along: 795,
        geo_datum: 796,
        executive_authority: 797,
        military_designation: 798,
        Air_Ministry_specification_ID: 799,
        notable_work: 800,
        student: 802,
        professorship: 803,
        GNIS_Antarctica_ID: 804,
        subject_of: 805,
        Italian_cadastre_code: 806,
        separated_from: 807,
        code_Bien_de_Interés_Cultural: 808,
        WDPA_id: 809,
        academic_minor: 811,
        academic_major: 812,
        retrieved: 813,
        IUCN_protected_areas_category: 814,
        ITIS_TSN: 815,
        decays_to: 816,
        decay_mode: 817,
        arXiv_ID: 818,
        ADS_bibcode: 819,
        arXiv_classification: 820,
        CGNDB_Unique_Identifier: 821,
        mascot: 822,
        speaker: 823,
        Meteoritical_Bulletin_Database_ID: 824,
        dedicated_to: 825,
        tonality: 826,
        BBC_program_identifier: 827,
        has_cause: 828,
        OEIS_ID: 829,
        Encyclopedia_of_Life_ID: 830,
        parent_club: 831,
        public_holiday: 832,
        interchange_station: 833,
        train_depot: 834,
        author_citation_zoology: 835,
        GSS_code_2011: 836,
        day_in_year_for_periodic_occurrence: 837,
        BioLib_ID: 838,
        IMSLP_ID: 839,
        narrative_location: 840,
        feast_day: 841,
        Fossilworks_ID: 842,
        SIRUTA_code: 843,
        UBIGEO_code: 844,
        Saskatchewan_Register_of_Heritage_Property_identifier: 845,
        Global_Biodiversity_Information_Facility_ID: 846,
        United_States_Navy_aircraft_designation: 847,
        Japanese_military_aircraft_designation: 849,
        World_Register_of_Marine_Species_identifier: 850,
        ESRB_rating: 852,
        CERO_rating: 853,
        reference_URL: 854,
        Sandbox_URL: 855,
        official_website: 856,
        CNKI: 857,
        ESPN_SCRUM_ID: 858,
        sponsor: 859,
        e_archivli_ID: 860,
        premiershiprugbycom_ID: 861,
        Operational_Requirement_of_the_UK_Air_Ministry: 862,
        InPhO_identifier: 863,
        ACM_Digital_Library_author_identifier: 864,
        BMLO: 865,
        Perlentaucher_ID: 866,
        ROME_Occupation_Code_v3: 867,
        foods_traditionally_associated: 868,
        instrumentation: 870,
        printed_by: 872,
        phase_point: 873,
        UN_class: 874,
        UN_code_classification: 875,
        UN_packaging_group: 876,
        NFPA_Other: 877,
        avionics: 878,
        pennant_number: 879,
        CPU: 880,
        type_of_variable_star: 881,
        FIPS_6_4_US_counties: 882,
        FIPS_5_2_code_for_US_states: 883,
        State_Water_Register_Code_Russia: 884,
        origin_of_the_watercourse: 885,
        LIR: 886,
        based_on_heuristic: 887,
        JSTOR_article_ID: 888,
        Mathematical_Reviews_identifier: 889,
        Request_for_Comments_identifier: 892,
        Social_Science_Research_Network_ID: 893,
        Zentralblatt_MATH: 894,
        United_States_Army_and_Air_Force_aircraft_designation: 897,
        IPA: 898,
        FIPS_10_4_countries_and_regions: 901,
        HDS: 902,
        PORT_film_identifier: 905,
        SELIBR: 906,
        allgame_ID: 907,
        PEGI_rating: 908,
        Nova_Scotia_Register_of_Historic_Places_identifier: 909,
        topics_main_category: 910,
        South_African_municipality_code: 911,
        facility: 912,
        notation: 913,
        USK_rating: 914,
        filming_location: 915,
        GSRR_rating: 916,
        GRAU_index: 917,
        NOC_Occupation_Code: 918,
        SOC_Occupation_Code_2010: 919,
        Spanish_subject_headings_for_public_libraries: 920,
        main_subject: 921,
        magnetic_ordering: 922,
        medical_examinations: 923,
        medical_treatment: 924,
        presynaptic_connection: 925,
        postsynaptic_connection: 926,
        anatomical_location: 927,
        activating_neurotransmitter: 928,
        color_space: 929,
        type_of_electrification: 930,
        place_served_by_airport: 931,
        PMCID: 932,
        heritagefoundationca_ID: 933,
        Commons_gallery: 935,
        work_location: 937,
        FishBase_species_identifier: 938,
        KSH_code: 939,
        GHS_precautionary_statements: 940,
        inspired_by: 941,
        theme_music: 942,
        programmer: 943,
        Code_of_nomenclature: 944,
        allegiance: 945,
        ISIN: 946,
        RSL_identifier_person: 947,
        Wikivoyage_banner: 948,
        NLI_Israel_identifier: 949,
        BNE_identifier: 950,
        NSZL_identifier: 951,
        ISCO_occupation_code: 952,
        full_text_available_at: 953,
        IBNR_identifier: 954,
        ISBN_10: 957,
        section_verse_or_paragraph: 958,
        MSW_identifier: 959,
        Tropicos_taxon_name_identifier: 960,
        IPNI_taxon_name_identifier: 961,
        MycoBank_taxon_name_identifier: 962,
        streaming_media_URL: 963,
        Austrian_municipality_key: 964,
        burial_plot_reference: 965,
        MusicBrainz_label_ID: 966,
        guest_of_honor: 967,
        e_mail: 968,
        located_at_street_address: 969,
        neurological_function: 970,
        category_combines_topics: 971,
        catalog: 972,
        described_at_URL: 973,
        tributary: 974,
        code_for_weekend_and_holiday_homes_Sweden: 980,
        BAG_code_for_Dutch_towns: 981,
        MusicBrainz_area_ID: 982,
        IOC_country_code: 984,
        Philippine_Standard_Geographic_Code: 988,
        spoken_text_audio: 989,
        recording_of_the_subjects_spoken_voice: 990,
        successful_candidate: 991,
        NFPA_Health: 993,
        NFPA_Fire: 994,
        NFPA_Reactivity: 995,
        scan_file_Commons: 996,
        dmoz: 998,
        ARICNS: 999,
        record_held: 1000,
        applies_to_jurisdiction: 1001,
        engine_configuration: 1002,
        NLR_Romania_identifier: 1003,
        MusicBrainz_place_ID: 1004,
        PTBNP_identifier: 1005,
        NTA_identifier_Netherlands: 1006,
        Lattes_Platform_number: 1007,
        Iran_statistics_ID: 1010,
        excluding: 1011,
        including: 1012,
        criterion_used: 1013,
        AAT_identifier: 1014,
        BIBSYS_identifier: 1015,
        asteroid_taxonomy: 1016,
        BAV_Vatican_Library_identifier: 1017,
        language_regulatory_body: 1018,
        feed_URL: 1019,
        KldB_2010_occupation_code: 1021,
        CNO_11_occupation_code: 1022,
        SBC_2010_occupation_code: 1023,
        SBFI_occupation_code: 1024,
        SUDOC_editions: 1025,
        doctoral_thesis: 1026,
        conferred_by: 1027,
        donated_by: 1028,
        crew_member: 1029,
        light_characteristic_of_a_lighthouse: 1030,
        legal_citation_of_this_text: 1031,
        Digital_Rights_Management_system: 1032,
        GHS_signal_word: 1033,
        main_food_source: 1034,
        honorific_suffix: 1035,
        Dewey_Decimal_Classification: 1036,
        manager_director: 1037,
        relative: 1038,
        type_of_kinship: 1039,
        film_editor: 1040,
        sockets_supported: 1041,
        ZDB_identifier: 1042,
        IDEO_Job_ID: 1043,
        SWB_editions: 1044,
        Sycomore_ID: 1045,
        discovery_method: 1046,
        Catholic_Hierarchy_person_ID: 1047,
        NCL_identifier: 1048,
        deity_of: 1049,
        medical_condition: 1050,
        PSH_ID: 1051,
        Portuguese_Job_Code_CPP_2010: 1052,
        ResearcherID: 1053,
        NDL_editions: 1054,
        NLM_Unique_ID: 1055,
        product: 1056,
        chromosome: 1057,
        ERA_Journal_ID: 1058,
        CVR: 1059,
        pathogen_transmission_process: 1060,
        track_gauge: 1064,
        archive_URL: 1065,
        student_of: 1066,
        Thailand_central_administrative_unit_code: 1067,
        instruction_set: 1068,
        Danemark_Job_Code_DISCO_08: 1069,
        PlantList_ID: 1070,
        location_of_final_assembly: 1071,
        readable_file_format: 1072,
        writable_file_format: 1073,
        fictional_analog_of: 1074,
        rector: 1075,
        ICTV_virus_ID: 1076,
        KOATUU_identifier: 1077,
        valvetrain_configuration: 1078,
        launch_contractor: 1079,
        from_fictional_universe: 1080,
        Human_Development_Index: 1081,
        population: 1082,
        seating_capacity: 1083,
        EUL_editions: 1084,
        LibraryThing_work_identifier: 1085,
        atomic_number: 1086,
        ELO_rating: 1087,
        Mohs_hardness: 1088,
        redshift: 1090,
        total_produced: 1092,
        gross_tonnage: 1093,
        orbital_eccentricity: 1096,
        g_factor: 1097,
        number_of_speakers: 1098,
        number_of_masts: 1099,
        number_of_cylinders: 1100,
        floors_above_ground: 1101,
        flattening: 1102,
        number_of_platforms: 1103,
        number_of_pages: 1104,
        sandbox_quantity: 1106,
        proportion: 1107,
        electronegativity: 1108,
        refractive_index: 1109,
        attendance: 1110,
        votes_received: 1111,
        Pokédex_number: 1112,
        series_length: 1113,
        quantity: 1114,
        ATVK_ID: 1115,
        Kallikratis_geographical_code: 1116,
        pKa: 1117,
        tennis_singles_ranking_deprecated: 1118,
        tennis_doubles_ranking_deprecated: 1119,
        number_of_deaths: 1120,
        oxidation_state: 1121,
        spin_quantum_number: 1122,
        parity: 1123,
        TEU: 1124,
        Gini_coefficient: 1125,
        isospin_quantum_number: 1126,
        isospin_z_component: 1127,
        employees: 1128,
        national_team_caps: 1129,
        number_of_participants: 1132,
        DGO4_identifier: 1133,
        nomenclatural_status: 1135,
        solved_by: 1136,
        fossil_found_in_this_unit: 1137,
        Kunstindeks_Danmark: 1138,
        floors_below_ground: 1139,
        EHAK_id: 1140,
        number_of_processor_cores: 1141,
        political_ideology: 1142,
        BN_Argentine_editions: 1143,
        LCOC_LCCN_bibliographic: 1144,
        Lagrangian_point: 1145,
        IAAF_ID: 1146,
        neutron_number: 1148,
        Library_of_Congress_Classification: 1149,
        Regensburg_Classification: 1150,
        topics_main_Wikimedia_portal: 1151,
        IPTC_Media_Topic: 1152,
        Scopus_Author_ID: 1153,
        Scopus_EID: 1154,
        Scopus_Affiliation_ID: 1155,
        Scopus_Source_ID: 1156,
        US_Congress_Bio_identifier: 1157,
        location_of_landing: 1158,
        CODEN: 1159,
        ISO_4_abbreviation: 1160,
        Z395_abbreviation: 1161,
        Bluebook_abbreviation: 1162,
        Internet_media_type: 1163,
        cardinality_of_the_group: 1164,
        home_world: 1165,
        USB_ID: 1167,
        municipality_code_Denmark: 1168,
        transmitted_signal: 1170,
        approximation_algorithm: 1171,
        Geokod: 1172,
        visitors_per_year: 1174,
        numeric_value: 1181,
        LIBRIS_editions: 1182,
        Gewässerkennzahl: 1183,
        handle: 1184,
        Rodovid_ID: 1185,
        MEP_directory_identifier: 1186,
        Dharma_Drum_Buddhist_College_person_ID: 1187,
        Dharma_Drum_Buddhist_College_place_ID: 1188,
        Chinese_Library_Classification: 1189,
        Universal_Decimal_Classification: 1190,
        first_performance: 1191,
        connecting_service: 1192,
        prevalence: 1193,
        received_signal: 1194,
        file_extension: 1195,
        manner_of_death: 1196,
        unemployment_rate: 1198,
        mode_of_inheritance: 1199,
        bodies_of_water_basin_category: 1200,
        space_tug: 1201,
        carries_scientific_instrument: 1202,
        Finnish_municipality_number: 1203,
        Wikimedia_portals_main_topic: 1204,
        NUKAT_WarsawU_authorities: 1207,
        ISMN: 1208,
        CN: 1209,
        supercharger: 1210,
        fuel_system: 1211,
        Atlas_ID: 1212,
        NLC_authorities: 1213,
        Riksdagen_person_id: 1214,
        apparent_magnitude: 1215,
        National_Heritage_List_for_England_number: 1216,
        Internet_Broadway_Database_venue_ID: 1217,
        Internet_Broadway_Database_production_ID: 1218,
        Internet_Broadway_Database_show_ID: 1219,
        Internet_Broadway_Database_person_ID: 1220,
        compressor_type: 1221,
        NARA_person_ID: 1222,
        NARA_organization_ID: 1223,
        NARA_geographic_ID: 1224,
        NARA_topical_subject_ID: 1225,
        NARA_specific_records_type_ID: 1226,
        astronomical_filter: 1227,
        Openpolis_ID: 1229,
        JSTOR_journal_code: 1230,
        NARA_catalog_record_ID: 1231,
        Linguist_list_code: 1232,
        ISFDB_author_ID: 1233,
        ISFDB_publication_ID: 1234,
        ISFDB_series_ID: 1235,
        Parsons_code: 1236,
        Box_Office_Mojo_film_ID: 1237,
        Swedish_Football_Association_ID: 1238,
        ISFDB_publisher_ID: 1239,
        Danish_Bibliometric_Research_Indicator_level: 1240,
        Swiss_Football_Association_Club_Number: 1241,
        Theatricalia_play_ID: 1242,
        International_Standard_Recording_Code: 1243,
        phone_number_URL: 1244,
        OmegaWiki_Defined_Meaning: 1245,
        patent_number: 1246,
        compression_ratio: 1247,
        KulturNav_id: 1248,
        time_of_earliest_written_record: 1249,
        Danish_Bibliometric_Research_Indicator_BFI_SNO_CNO: 1250,
        ABS_ASCL_code: 1251,
        AUSTLANG_code: 1252,
        BCU_Ecrivainsvd: 1253,
        Slovenska_biografija_ID: 1254,
        Helveticarchives_ID: 1255,
        Iconclass_notation: 1256,
        depicts_Iconclass_notation: 1257,
        Rotten_Tomatoes_identifier: 1258,
        coordinates_of_the_point_of_view: 1259,
        Cultural_heritage_database_in_Sweden: 1260,
        Rundata: 1261,
        RAÄ_nummer: 1262,
        NNDB_people_ID: 1263,
        valid_in_period: 1264,
        AlloCiné_movie_ID: 1265,
        AlloCiné_person_ID: 1266,
        AlloCiné_serie_ID: 1267,
        represents_organisation: 1268,
        facet_of: 1269,
        Norway_Database_for_Statistics_on_Higher_education_periodical_ID: 1270,
        Norway_Database_for_Statistics_on_Higher_education_publisher_ID: 1271,
        Norway_Import_Service_and_Registration_Authority_periodical_code: 1272,
        CANTIC: 1273,
        ISFDB_title_ID: 1274,
        Norway_Import_Service_and_Registration_Authority_publisher_code: 1275,
        Dictionnaire_du_Jura_ID: 1276,
        Jufo_ID: 1277,
        Legal_Entity_Identifier: 1278,
        inflation_rate: 1279,
        CONOR_identifier: 1280,
        WOEID: 1281,
        OpenStreetMap_tag_or_key: 1282,
        filmography: 1283,
        Munzinger_IBA: 1284,
        Munzinger_Sport: 1285,
        Munzinger_Pop_identifier: 1286,
        KDG_Komponisten_der_Gegenwart: 1287,
        KLG_Kritisches_Lexikon_der_Gegenwartsliteratur: 1288,
        KLfG_Kritisches_Lexikon_der_fremdsprachigen_Gegenwartsliteratur: 1289,
        godparent: 1290,
        Association_Authors_of_Switzerland_ID: 1291,
        DNB_editions: 1292,
        Royal_Aero_Club_Aviators_Certificate_ID: 1293,
        WWF_ecoregion_code: 1294,
        emissivity: 1295,
        Gran_Enciclopèdia_Catalana_ID: 1296,
        IRS_Employer_Identification_Number: 1297,
        depicted_by: 1299,
        bibcode: 1300,
        number_of_elevators: 1301,
        primary_destinations: 1302,
        instrument: 1303,
        central_bank: 1304,
        Skyscraper_Center_ID: 1305,
        Swiss_parliament_identifier: 1307,
        officeholder: 1308,
        EGAXA_identifier: 1309,
        statement_disputed_by: 1310,
        lostbridgesorg_ID: 1311,
        has_facet_polytope: 1312,
        office_held_by_head_of_government: 1313,
        number_of_spans: 1314,
        People_Australia_identifier: 1315,
        SMDB_ID: 1316,
        floruit: 1317,
        proved_by: 1318,
        earliest_date: 1319,
        OpenCorporates_ID: 1320,
        place_of_origin_Switzerland: 1321,
        dual_to: 1322,
        Terminologia_Anatomica_98: 1323,
        source_code_repository: 1324,
        external_data_available_at: 1325,
        latest_date: 1326,
        professional_or_sports_partner: 1327,
        phone_number: 1329,
        MusicBrainz_instrument_ID: 1330,
        PACE_member_ID: 1331,
        coordinate_of_northernmost_point: 1332,
        coordinate_of_southernmost_point: 1333,
        coordinate_of_easternmost_point: 1334,
        coordinate_of_westernmost_point: 1335,
        territory_claimed_by: 1336,
        EPSG_ID: 1338,
        number_of_injured: 1339,
        eye_color: 1340,
        Italian_Chamber_of_Deputies_ID: 1341,
        number_of_members: 1342,
        described_by_source: 1343,
        participant_of: 1344,
        number_of_victims: 1345,
        winner: 1346,
        military_casualty_classification: 1347,
        AlgaeBase_URL: 1348,
        ploidy: 1349,
        number_of_matches_played: 1350,
        number_of_points_goals_scored: 1351,
        ranking: 1352,
        original_spelling: 1353,
        shown_with_features: 1354,
        wins: 1355,
        losses: 1356,
        matches_games_drawn_tied: 1357,
        points_for: 1358,
        number_of_points_goals_conceded: 1359,
        Monte_Carlo_Particle_Number: 1360,
        Theaterlexikon_der_Schweiz_online_ID: 1362,
        points_goal_scored_by: 1363,
        ITTF_ID: 1364,
        replaces: 1365,
        replaced_by: 1366,
        BBC_Your_Paintings_artist_identifier: 1367,
        LNB_identifier: 1368,
        Iranian_National_Heritage_registration_number: 1369,
        IHSI_ID: 1370,
        ASI_Monument_ID: 1371,
        binding_of_software_library: 1372,
        daily_ridership: 1373,
        NSK_identifier: 1375,
        capital_of: 1376,
        MTR_station_code: 1377,
        China_railway_TMIS_station_code: 1378,
        uglybridgescom_ID: 1380,
        bridgehuntercom_ID: 1381,
        coincident_with: 1382,
        contains_settlement: 1383,
        Enciclopédia_Açoriana_ID: 1385,
        Japanese_High_School_Code: 1386,
        political_alignment: 1387,
        German_regional_key: 1388,
        product_certification: 1389,
        match_time_of_score_minutes: 1390,
        Index_Fungorum_ID: 1391,
        ComicBookDB_ID: 1392,
        proxy: 1393,
        Glottolog_code: 1394,
        National_Cancer_Institute_ID: 1395,
        Linguasphere_code: 1396,
        State_Catalogue_of_Geographical_Names_identifier_Russia: 1397,
        replaced_by_structure: 1398,
        convicted_of: 1399,
        FCC_Facility_ID: 1400,
        bug_tracking_system: 1401,
        Foundational_Model_of_Anatomy_ID: 1402,
        original_combination: 1403,
        World_Glacier_Inventory_ID: 1404,
        script_directionality: 1406,
        MusicBrainz_series_ID: 1407,
        licensed_to_broadcast_to: 1408,
        Cycling_Archives_Cyclist_ID: 1409,
        number_of_seats_in_legislature: 1410,
        nominated_for: 1411,
        languages_spoken_or_published: 1412,
        SFDb_ID: 1413,
        GUI_toolkit_or_framework: 1414,
        Oxford_Biography_Index_Number: 1415,
        affiliation: 1416,
        Encyclopædia_Britannica_Online_ID: 1417,
        orbits_completed: 1418,
        shape: 1419,
        taxon_synonym: 1420,
        GRIN_URL: 1421,
        Sandrartnet_person_ID: 1422,
        templates_main_topic: 1423,
        topics_main_template: 1424,
        ecoregion_WWF: 1425,
        journey_origin: 1427,
        Lost_Art_ID: 1428,
        pet: 1429,
        OpenPlaques_subject_identifier: 1430,
        executive_producer: 1431,
        b_side: 1432,
        published_in: 1433,
        describes_the_fictional_universe: 1434,
        heritage_status: 1435,
        collection_or_exhibition_size: 1436,
        plea: 1437,
        Jewish_Encyclopedia_ID_Russian: 1438,
        Norsk_filmografi_ID: 1439,
        Fide_ID: 1440,
        present_in_work: 1441,
        image_of_grave: 1442,
        score_method: 1443,
        journey_destination: 1444,
        fictional_universe_described_in: 1445,
        number_of_missing: 1446,
        Sports_Reference_ID: 1447,
        official_name: 1448,
        nickname: 1449,
        Sandbox_Monolingual_text: 1450,
        motto_text: 1451,
        catholicru_identifier: 1453,
        legal_form: 1454,
        list_of_works: 1455,
        list_of_monuments: 1456,
        absolute_magnitude: 1457,
        color_index: 1458,
        Cadw_Building_ID: 1459,
        NIEA_building_ID: 1460,
        Patientplus_ID: 1461,
        standards_body: 1462,
        PRDL_Author_ID: 1463,
        category_for_people_born_here: 1464,
        category_for_people_who_died_here: 1465,
        WALS_lect_code: 1466,
        WALS_genus_code: 1467,
        WALS_family_code: 1468,
        FIFA_player_code: 1469,
        maximum_glide_ratio: 1470,
        reporting_mark: 1471,
        Commons_Creator_page: 1472,
        Nupill_Literatura_Digital___Author: 1473,
        Nupill_Literatura_Digital___Document: 1474,
        title: 1476,
        birth_name: 1477,
        has_immediate_cause: 1478,
        has_contributing_factor: 1479,
        sourcing_circumstances: 1480,
        viciorg_ID: 1481,
        Stack_Exchange_tag: 1482,
        kulturnoe_nasledieru_ID: 1483,
        Glad_identifier: 1529,
        parents_of_this_hybrid: 1531,
        country_for_sport: 1532,
        family_name_identical_to_this_first_name: 1533,
        end_cause: 1534,
        used_by: 1535,
        immediate_cause_of: 1536,
        contributing_factor_of: 1537,
        number_of_households: 1538,
        female_population: 1539,
        male_population: 1540,
        Cycling_Quotient_identifier: 1541,
        cause_of: 1542,
        monogram: 1543,
        Federal_Register_Document_Number: 1544,
        series_ordinal: 1545,
        motto: 1546,
        depends_on: 1547,
        maximum_Strahler_number: 1548,
        demonym: 1549,
        Orphanet_ID: 1550,
        Exceptional_heritage_of_Wallonia_identifier: 1551,
        has_quality: 1552,
        YandexMusic_ID: 1553,
        UBERON_ID: 1554,
        Executive_Order_number: 1555,
        author_ID: 1556,
        manifestation_of: 1557,
        tempo_marking: 1558,
        name_in_native_language: 1559,
        given_name_version_for_other_gender: 1560,
        number_of_survivors: 1561,
        AllMovie_movie_ID: 1562,
        MacTutor_id_biographies: 1563,
        At_the_Circulating_Library_ID: 1564,
        Enciclopedia_de_la_Literatura_en_México_ID: 1565,
        GeoNames_ID: 1566,
        NIS_INS_code: 1567,
        domain: 1568,
        number_of_edges: 1569,
        number_of_vertices: 1570,
        codomain: 1571,
        BBC_Genome_identifier: 1573,
        exemplar_of: 1574,
        RISS_catalog: 1575,
        lifestyle: 1576,
        Gregory_Aland_Number: 1577,
        Gmelin_Number: 1578,
        Beilstein_Registry_Number: 1579,
        University_of_Barcelona_authority_ID: 1580,
        official_blog: 1581,
        natural_product_of_taxon: 1582,
        MalaCards_ID: 1583,
        Pleiades_identifier: 1584,
        municipality_code_of_Brazil: 1585,
        Catalan_object_of_cultural_interest_ID: 1586,
        Slovene_Cultural_Heritage_Register_ID: 1587,
        Desa_code_of_Indonesia: 1588,
        deepest_point: 1589,
        number_of_casualties: 1590,
        defendant: 1591,
        prosecutor: 1592,
        defender: 1593,
        judge: 1594,
        charge: 1595,
        penalty: 1596,
        consecrator: 1598,
        Cambridge_Alumni_Database_ID: 1599,
        code_Inventari_del_Patrimoni_Arquitectònic_de_Catalunya: 1600,
        Esperantist_ID: 1601,
        BBC_Your_Paintings_venue_identifier: 1602,
        number_of_cases: 1603,
        biosafety_level: 1604,
        has_natural_reservoir: 1605,
        natural_reservoir_of: 1606,
        Dialnet_author_ID: 1607,
        Dialnet_book: 1608,
        Dialnet_journal: 1609,
        Dialnet_article: 1610,
        NATO_code_for_grade: 1611,
        Commons_Institution_page: 1612,
        IRC_channel: 1613,
        History_of_Parliament_ID: 1614,
        CLARA_ID: 1615,
        SIREN_number: 1616,
        BBC_Things_identifer: 1617,
        sport_number: 1618,
        date_of_official_opening: 1619,
        plaintiff: 1620,
        detail_map: 1621,
        drives_on_the: 1622,
        MarineTraffic_Port_ID: 1624,
        has_melody: 1625,
        Thai_cultural_heritage_ID: 1626,
        Ethnologuecom_code: 1627,
        equivalent_property: 1628,
        subject_item_of_this_property: 1629,
        formatter_URL: 1630,
        China_Vitae_ID: 1631,
        Hermann_Mauguin_notation: 1632,
        religious_name: 1635,
        date_of_baptism_in_early_childhood: 1636,
        undercarriage: 1637,
        working_title: 1638,
        pendant_of: 1639,
        curator: 1640,
        port: 1641,
        acquisition_transaction: 1642,
        departure_transaction: 1643,
        EgliseInfo_ID: 1644,
        NIST_CODATA_ID: 1645,
        mandatory_qualifier: 1646,
        subproperty_of: 1647,
        Dictionary_of_Welsh_Biography_ID: 1648,
        Korean_Movie_Database_ID: 1649,
        BBF_identifier: 1650,
        YouTube_video_identifier: 1651,
        referee: 1652,
        TERYT_municipality_code: 1653,
        wing_configuration: 1654,
        station_number: 1655,
        unveiled_by: 1656,
        MPAA_film_rating: 1657,
        number_of_faces: 1658,
        see_also: 1659,
        has_index_case: 1660,
        Alexa_rank: 1661,
        DOI_Prefix: 1662,
        ProCyclingStats_ID: 1663,
        Cycling_Database_ID: 1664,
        Chess_Games_ID: 1665,
        Chess_Club_ID: 1666,
        TGN_identifier: 1667,
        ATCvet: 1668,
        CONA__identifier: 1669,
        LAC_identifier: 1670,
        route_number: 1671,
        this_taxon_is_source_of: 1672,
        general_formula: 1673,
        number_confirmed: 1674,
        number_probable: 1675,
        number_suspected: 1676,
        index_case_of: 1677,
        has_vertex_figure: 1678,
        BBC_Your_Paintings_artwork_identifier: 1679,
        subtitle: 1680,
        quote: 1683,
        inscription: 1684,
        Pokémon_browser_number: 1685,
        for_work: 1686,
        Wikidata_property: 1687,
        AniDB_identifier: 1688,
        central_government_debt_as_a_percent_of_GDP: 1689,
        ICD_10_PCS: 1690,
        operations_and_procedures_key_OPS: 1691,
        ICD_9_CM: 1692,
        Terminologia_Embryologica_TE: 1693,
        Terminologia_Histologica_TH: 1694,
        NLP_identifier: 1695,
        inverse_of: 1696,
        total_valid_votes: 1697,
        SkyscraperPage_building_id: 1699,
        SIPA_identifier: 1700,
        IGESPAR_identifier: 1702,
        pollination: 1703,
        pollenizer: 1704,
        native_label: 1705,
        together_with: 1706,
        DAAO_identifier: 1707,
        LfDS_object_ID: 1708,
        equivalent_class: 1709,
        Sächsische_Biografie: 1710,
        British_Museum_person_institution: 1711,
        Metacritic_ID: 1712,
        biography_at_the_Bundestag_of_Germany: 1713,
        Journalisted_ID: 1714,
        RKD_ESD_identifier_Slovenia: 1715,
        brand: 1716,
        SANDRE_ID: 1717,
        pinyin_transliteration: 1721,
        beats_per_minute: 1725,
        Florentine_musea_Inventario_1890__ID: 1726,
        Flora_of_North_America_taxon_ID: 1727,
        AllMusic_artist_ID: 1728,
        AllMusic_album_ID: 1729,
        AllMusic_song_ID: 1730,
        Fach: 1731,
        Naturbase_ID: 1732,
        Steam_ID: 1733,
        oath_of_office_date: 1734,
        Comediench_identifier: 1735,
        Information_Center_for_Israeli_Art_artist_identifier: 1736,
        Merck_Index_monograph: 1738,
        CiNii_book_identifer: 1739,
        category_for_films_shot_at_this_location: 1740,
        GTAA_id: 1741,
        Bradley_and_Fletcher_checklist_number: 1743,
        Agassiz_et_al_checklist_number: 1744,
        VASCAN_ID: 1745,
        ZooBank_nomenclatural_act: 1746,
        Flora_of_China_ID: 1747,
        NCI_Thesaurus_ID: 1748,
        Parlement__Politiek_ID: 1749,
        name_day: 1750,
        BBC_Your_Paintings_collection_identifier: 1751,
        scale: 1752,
        list_related_to_category: 1753,
        category_related_to_list: 1754,
        Aviation_Safety_Network_accident_description_ID: 1755,
        Aviation_Safety_Network_Wikibase_Occurrence: 1760,
        Watson__Dallwitz_family_ID: 1761,
        Hornbostel_Sachs_classification: 1762,
        National_Pipe_Organ_Register_identifier: 1763,
        Flemish_organization_for_Immovable_Heritage_relict_ID: 1764,
        place_name_sign: 1766,
        denkXweb_identifier: 1769,
        Romania_LMI_code: 1770,
        Integrated_Postsecondary_Education_Data_System_identifier: 1771,
        USDA_PLANTS_ID: 1772,
        attributed_to: 1773,
        workshop_of: 1774,
        follower_of: 1775,
        circle_of: 1776,
        manner_of: 1777,
        forgery_after: 1778,
        possible_creator: 1779,
        school_of: 1780,
        courtesy_name: 1782,
        temple_name: 1785,
        posthumous_name: 1786,
        art_name: 1787,
        DVN_identifier: 1788,
        chief_operating_officer: 1789,
        BioStor_author_identifier: 1790,
        category_of_people_buried_here: 1791,
        category_of_associated_people: 1792,
        format_as_a_regular_expression: 1793,
        bureau_du_patrimoine_de_Seine_Saint_Denis_ID: 1794,
        Smithsonian_American_Art_Museum_person_institution_thesaurus_id: 1795,
        International_Standard_Industrial_Classification_code: 1796,
        ISO_639_5_code: 1798,
        Maltese_Islands_National_Inventory_of_Cultural_Property_identifier: 1799,
        Wikimedia_database_name: 1800,
        commemorative_plaque_image: 1801,
        EMLO_person_identifier: 1802,
        Masaryk_University_person_ID: 1803,
        Danish_National_Filmography_ID: 1804,
        World_Health_Organisation_International_Nonproprietary_Name: 1805,
        ABoK_number: 1806,
        Great_Aragonese_Encyclopedia_ID: 1807,
        senatfr_ID: 1808,
        choreographer: 1809,
        named_as: 1810,
        list_of_episodes: 1811,
        short_name: 1813,
        name_in_kana: 1814,
        RSL_scanned_books_identifier: 1815,
        National_Portrait_Gallery_London_person_identifier: 1816,
        addressee: 1817,
        KH: 1818,
        genealogicsorg_person_ID: 1819,
        Open_Food_Facts_food_additive_slug: 1820,
        Open_Food_Facts_food_category_slug: 1821,
        DSH_object_ID: 1822,
        BAnQ_ID: 1823,
        road_number: 1824,
        Baseball_Referencecom_major_league_player_ID: 1825,
        Baseball_Referencecom_minor_league_player_ID: 1826,
        ISWC: 1827,
        IPI_number: 1828,
        Roud_Folk_Song_Index: 1829,
        owner_of: 1830,
        electorate: 1831,
        GrassBase_ID: 1832,
        number_of_registered_users_contributors: 1833,
        draft_pick_number: 1836,
        Gaoloumi_ID: 1837,
        PSS_archi_ID: 1838,
        US_Federal_Election_Commission_identifier: 1839,
        investigated_by: 1840,
        Swedish_district_code: 1841,
        Global_Anabaptist_Mennonite_Encyclopedia_Online_identifier: 1842,
        taxon_common_name: 1843,
        HathiTrust_id: 1844,
        anti_virus_alias: 1845,
        distribution_map: 1846,
        Nasjonalbiblioteket_photographer_ID: 1847,
        INPN_Code: 1848,
        SSR_WrittenForm_ID: 1849,
        SSR_Name_ID: 1850,
        input_set: 1851,
        Perry_Index: 1852,
        blood_type: 1853,
        Kiev_street_code: 1854,
        Wikidata_property_example: 1855,
        Wikidata_example_media_file: 1856,
        Wikidata_example_string: 1858,
        Wikidata_example_item_value: 1859,
        Wikidata_example_URL: 1860,
        Wikidata_example_time: 1861,
        Wikidata_example_quantity: 1862,
        Wikidata_example_property: 1863,
        Wikidata_example_monolingual_text: 1864,
        Wikidata_example_geographic_coordinates: 1865,
        Catholic_Hierarchy_diocese_ID: 1866,
        eligible_voters: 1867,
        ballots_cast: 1868,
        Hall_of_Valor_ID: 1869,
        Name_Assigning_Authority_Number: 1870,
        CERL_ID: 1871,
        minimum_number_of_players: 1872,
        maximum_number_of_players: 1873,
        Netflix_Identifier: 1874,
        represented_by: 1875,
        spacecraft: 1876,
        after_a_work_by: 1877,
        Vox_ATypI_classification: 1878,
        income_classification_Philippines: 1879,
        measured_by: 1880,
        list_of_characters: 1881,
        Web_Gallery_of_Art_identifier: 1882,
        Declaratororg_ID: 1883,
        hair_color: 1884,
        cathedral: 1885,
        Smithsonian_volcano_identifier: 1886,
        vice_county: 1887,
        Dictionary_of_Medieval_Names_from_European_Sources_entry: 1888,
        different_from: 1889,
        BNC_identifier: 1890,
        signatory: 1891,
        OpenPlaques_plaque_identifier: 1893,
        Danish_urban_area_code: 1894,
        Fauna_Europaea_ID: 1895,
        source_website: 1896,
        highest_note: 1897,
        lowest_note: 1898,
        Librivox_author_ID: 1899,
        EAGLE_id: 1900,
        BALaT_person_organisation_id: 1901,
        Spotify_artist_ID: 1902,
        Volcanic_explosivity_index: 1903,
        FundRef_registry_name: 1905,
        office_held_by_head_of_state: 1906,
        Australian_Dictionary_of_Biography_identifier: 1907,
        Commonwealth_War_Graves_Commission_person_identifier: 1908,
        side_effect: 1909,
        decreased_expression_in: 1910,
        increased_expression_in: 1911,
        deletion_association_with: 1912,
        gene_duplication_association_with: 1913,
        gene_insertion_association_with: 1914,
        gene_inversion_association_with: 1915,
        gene_substitution_association_with: 1916,
        posttranslational_modification_association_with: 1917,
        altered_regulation_leads_to: 1918,
        Ministry_of_Education_of_Chile_school_ID: 1919,
        Commonwealth_War_Graves_Commission_burial_ground_identifier: 1920,
        URI_pattern_for_RDF_resource: 1921,
        first_line: 1922,
        participating_team: 1923,
        vaccine_for: 1924,
        VIOLIN_ID: 1925,
        Vaccine_Ontology_ID: 1928,
        Clinvar_Accession_Number: 1929,
        DSM_V: 1930,
        PGCH_ID: 1931,
        stated_as: 1932,
        MobyGames_ID: 1933,
        Animatorru_work_ID: 1934,
        DBCS_ID: 1935,
        Digital_Atlas_of_the_Roman_Empire_ID: 1936,
        UN_LOCODE: 1937,
        Project_Gutenberg_author_ID: 1938,
        Dyntaxa_ID: 1939,
        conifersorg_ID: 1940,
        McCune_Reischauer_romanization: 1942,
        location_map: 1943,
        relief_location_map: 1944,
        street_key: 1945,
        National_Library_of_Ireland_authority: 1946,
        Mapillary_ID: 1947,
        BerlPap_identifier: 1948,
        CulturaItalia_ID: 1949,
        second_surname_in_Spanish_name: 1950,
        investor: 1951,
        Encyclopaedia_Metallum_band_ID: 1952,
        Discogs_artist_ID: 1953,
        Discogs_master_ID: 1954,
        Discogs_label_ID: 1955,
        takeoff_and_landing_capability: 1956,
        Wikisource_index_page: 1957,
        Trismegistos_Geo_ID: 1958,
        Dutch_Senate_person_ID: 1959,
        Google_Scholar_ID: 1960,
        identifier_of_Comité_des_travaux_historiques_et_scientifiques: 1961,
        patron: 1962,
        properties_for_this_type: 1963,
        sortkey: 1964,
        Biblioteca_Nacional_de_Chile_catalogue_number: 1966,
        BoxRec_ID: 1967,
        Foursquare_venue_ID: 1968,
        MovieMeter_director_ID: 1969,
        MovieMeter_movie_identifier: 1970,
        number_of_children: 1971,
        Open_Hub_ID: 1972,
        RSL_editions: 1973,
        INEGI_locality_identifier: 1976,
        lesarchivesduspectacle_ID: 1977,
        USDA_NDB_number: 1978,
        Righteous_Among_The_Nations_ID: 1979,
        PolSys_ID: 1980,
        FSK_film_rating: 1981,
        Anime_News_Network_person_ID: 1982,
        Anime_News_Network_company_ID: 1983,
        Anime_News_Network_manga_ID: 1984,
        Anime_News_Network_anime_ID: 1985,
        Dizionario_Biografico_degli_Italiani: 1986,
        MCN_code: 1987,
        Delarge_ID: 1988,
        Encyclopaedia_Metallum_artist_ID: 1989,
        species_kept: 1990,
        LPSN_URL: 1991,
        Plazi_ID: 1992,
        TeX_string: 1993,
        AllMusic_composition_ID: 1994,
        medical_specialty: 1995,
        parliamentuk_bio_link: 1996,
        Facebook_Places_ID: 1997,
        UCI_code: 1998,
        UNESCO_language_status: 1999,
        CPDL_ID: 2000,
        Revised_Romanisation: 2001,
        Twitter_username: 2002,
        Instagram_username: 2003,
        NALT_id: 2004,
        Catalogus_Professorum_Halensis: 2005,
        ZooBank_author_ID: 2006,
        ZooBank_publication_ID: 2007,
        IPNI_publication_ID: 2008,
        Exif_model: 2009,
        Exif_make: 2010,
        Cooper_Hewitt_Person_ID: 2011,
        cuisine: 2012,
        Facebook_ID: 2013,
        MoMA_artwork_id: 2014,
        Hansard_ID: 2015,
        Catalogus_Professorum_Academiae_Groninganae_id: 2016,
        isomeric_SMILES: 2017,
        Teuchos_ID: 2018,
        AllMovie_artist_ID: 2019,
        worldfootballnet_ID: 2020,
        Erdős_number: 2021,
        German_cattle_breed_ID: 2024,
        Find_A_Grave_cemetery_ID: 2025,
        Avibase_ID: 2026,
        Colour_Index_International_constitution_ID: 2027,
        United_States_Armed_Forces_service_number: 2028,
        Dictionary_of_Ulster_Biography_ID: 2029
    }
} ;

exports.properties = properties;

},{}],12:[function(require,module,exports){
'use strict';

// Uncomment when running in Node:
//var jsdom = require("jsdom");
//var $ = require("jquery")(jsdom.jsdom().defaultView);

function WikiDataItem ( init_wd , init_raw ) {

    // Variables
    this.wd = init_wd ;
    this.raw = init_raw ;
    this.placeholder = init_raw === undefined ;

    // Constructor

    // Methods
    this.isPlaceholder = function () { return this.placeholder ; };
    this.isItem = function () { return (this.raw||{ns:-1}).ns == 0 ; };
    this.isProperty = function () { return (this.raw||{ns:-1}).ns == 120 ; };
    this.getID = function () { return (this.raw||{}).id ; };

    this.getURL = function () {
        if ( typeof(this.raw) == 'undefined' ) return '' ;
        var ret = "https://www.wikidata.org/wiki/" ;
        ret += this.raw.title ;
        return ret ;
    };

    this.getPropertyList = function () {
        var self = this ;
        var ret = [] ;
        $.each ( (self.raw.claims||{}) , function ( p , dummy ) {
            ret.push ( p ) ;
        } ) ;
        return ret ;
    };

    this.getLink = function ( o ) {
        var self = this ;
        if ( undefined === o ) o = {} ;
        var h = "<a " ;
        $.each ( ['target','class'] , function ( dummy , v ) {
            if ( undefined !== o[v] ) h += v + "='" + o[v] + "' " ;
        } ) ;
        if ( o.add_q ) h += "q='" + self.raw.title + "' " ;
        if ( undefined !== o.desc ) h += "title='" + self.getDesc() + "' " ;
        else h += "title='" + self.raw.title + "' " ;
        var url = self.getURL() ;
        h += "href='" + url + "'>" ;
        if ( o.title !== undefined ) h += o.title ;
        else if ( o.ucfirst ) h += ucFirst ( self.getLabel() ) ;
        else h += self.getLabel() ;
        h += "</a>" ;
        return h ;
    };

    this.getAliases = function ( include_labels ) {
        var self = this ;
        var ret = [] ;
        var aliases = {} ;
        $.each ( (self.raw.aliases||{}) , function ( lang , v1 ) {
            $.each ( v1 , function ( k2 , v2 ) {
                aliases[v2.value] = 1 ;
            } ) ;
        } ) ;
        if ( include_labels ) {
            $.each ( (self.raw.labels||{}) , function ( lang , v1 ) {
                aliases[v1.value] = 1 ;
            } ) ;
        }
        $.each ( aliases , function ( k , v ) { ret.push ( k ) } ) ;
        return ret ;
    };

    this.getAliasesForLanguage = function ( lang , include_labels ) {
        var self = this ;
        var ret = [] ;
        var aliases = {} ;
        var v1 = ((self.raw.aliases||{})[lang]||{}) ;
        $.each ( v1 , function ( k2 , v2 ) {
            aliases[v2.value] = 1 ;
        } ) ;
        if ( include_labels ) {
            var v1 = (self.raw.labels||{})[lang] ;
            if ( typeof v1 != 'undefined' ) aliases[v1.value] = 1 ;
        }
        $.each ( aliases , function ( k , v ) { ret.push ( k ) } ) ;
        return ret ;
    };

    this.getStringsForProperty = function ( p ) {
        return this.getMultimediaFilesForProperty ( p ) ;
    };

    this.getMultimediaFilesForProperty = function ( p ) {
        var self = this ;
        var ret = [] ;
        var claims = self.getClaimsForProperty ( p ) ;
        $.each ( claims , function ( dummy , c ) {
            var s = self.getClaimTargetString ( c ) ;
            if ( undefined === s ) return ;
            ret.push ( s ) ;
        } ) ;
        return ret ;
    };

    this.getClaimsForProperty = function ( p ) {
        p = this.wd.convertToStringArray ( p , 'P' ) [0] ;
        if ( undefined === this.raw || undefined === this.raw.claims ) return [] ;
        return this.raw.claims[this.wd.getUnifiedID(p)]||[] ;
    };

    this.hasClaims = function ( p ) {
        var claims = this.getClaimsForProperty ( p ) ;
        return claims.length > 0 ;
    };

    this.getClaimLabelsForProperty = function ( p ) {
        var self = this ;
        var ret = [] ;
        var claims = self.getClaimsForProperty ( p ) ;
        $.each ( claims , function ( dummy , c ) {
            var q = self.getClaimTargetItemID ( c ) ;
            if ( q === undefined ) return ;
            if ( undefined === self.wd.items[q] ) return ;
            ret.push ( self.wd.items[q].getLabel() ) ;
        } ) ;
        return ret ;
    };

    this.getClaimItemsForProperty = function ( p , return_all ) {
        var self = this ;
        var ret = [] ;
        var claims = self.getClaimsForProperty ( p ) ;
        $.each ( claims , function ( dummy , c ) {
            var q = self.getClaimTargetItemID ( c ) ;
            if ( q === undefined ) return ;
            if ( undefined === self.wd.items[q] && !return_all ) return ;
            ret.push ( q ) ;
        } ) ;
        return ret ;
    };

    this.getSnakObject = function ( s ) {
        var o = {} ;
        if ( undefined === s ) return o ;

        if ( undefined !== s.datavalue ) {
            if ( s.datavalue.type == 'wikibase-entityid' ) {
                o.type = 'item' ;
                o.q = 'Q' + s.datavalue.value['numeric-id'] ;
                o.key = o.q ;
            } else if ( s.datavalue.type == 'string' ) {
                o.type = 'string' ;
                o.s = s.datavalue.value ;
                o.key = o.s ;
            } else if ( s.datavalue.type == 'time' ) {
                o.type = 'time' ;
                $.extend ( true , o , s.datavalue.value ) ;
                o.key = o.time ; // TODO FIXME
            } else if ( s.datavalue.type == 'globecoordinate' ) {
                o.type = 'globecoordinate' ;
                $.extend ( true , o , s.datavalue.value ) ;
                o.key = o.latitude+'/'+o.longitude ; // TODO FIXME
            } else if ( s.datavalue.type == 'quantity' ) {
                o.type = 'quantity' ;
                $.extend ( true , o , s.datavalue.value ) ;
                o.key = o.amount ; // TODO FIXME
            }
        }
        return o ;
    };

    this.getClaimObjectsForProperty = function ( p ) {
        var self = this ;
        var ret = [] ;
        var claims = self.getClaimsForProperty ( p ) ;
        $.each ( claims , function ( dummy , c ) {
            var o = self.getSnakObject ( c.mainsnak ) ;
            if ( o.type === undefined ) return ;
            o.rank = c.rank ;
            o.qualifiers = {} ;
            $.each ( (c.qualifiers||[]) , function ( qp , qv ) {
                o.qualifiers[qp] = [] ;
                $.each ( qv , function ( k , v ) {
                    o.qualifiers[qp].push ( self.getSnakObject ( v ) ) ;
                } ) ;
            } ) ;
            ret.push ( o ) ;
        } ) ;
        return ret ;
    };

    this.getDesc = function ( language ) {
        var self = this ;
        var desc = '' ;
        if ( undefined === language ) {
            $.each ( self.wd.main_languages , function ( dummy , lang ) {
                var l = self.getDesc ( lang ) ;
                if ( l == desc ) return ;
                desc = l ;
                return false ;
            } ) ;
        } else {
            if ( self.raw !== undefined && self.raw.descriptions !== undefined &&
                self.raw.descriptions[language] !== undefined && self.raw.descriptions[language].value !== undefined )
                    desc = self.raw.descriptions[language].value ;
        }
        return desc ;
    };

    this.getLabelDefaultLanguage = function () {
        var self = this ;
        var default_label = self.getID() ; // Fallback
        var ret = '' ;
        $.each ( self.wd.main_languages , function ( dummy , lang ) {
            var l = self.getLabel ( lang ) ;
            if ( l == default_label ) return ;
            ret = lang ;
            return false ;
        } ) ;
        return ret ;
    };

    this.getLabel = function ( language ) {
        var self = this ;
        var label = self.getID() ; // Fallback
        if ( undefined === language ) {
            $.each ( self.wd.main_languages , function ( dummy , lang ) {
                var l = self.getLabel ( lang ) ;
                if ( l == label ) return ;
                label = l ;
                return false ;
            } ) ;
        } else {
            if ( self.raw !== undefined && self.raw.labels !== undefined &&
                self.raw.labels[language] !== undefined && self.raw.labels[language].value !== undefined )
                    label = self.raw.labels[language].value ;
        }
        return label ;
    };

    this.getWikiLinks = function () {
        if ( typeof(this.raw) == 'undefined' ) return {} ;
        return (this.raw.sitelinks||{}) ;
    };

    this.getClaimRank = function ( claim ) {
        if ( claim === undefined ) return undefined ;
        return claim.rank || 'normal' ; // default
/*		if ( claim.rank === undefined ) return undefined ;
        if ( claim.rank == 'normal' ) return 0 ;
        if ( claim.rank == 'deptecated' ) return -1 ;
        if ( claim.rank == 'preferred' ) return 1 ;
        return undefined ;*/
    };

    this.getClaimTargetItemID = function ( claim ) {
        if ( claim === undefined ) return undefined ;
        if ( claim.mainsnak === undefined ) return undefined ;
        if ( claim.mainsnak.datavalue === undefined ) return undefined ;
        if ( claim.mainsnak.datavalue.value === undefined ) return undefined ;
        if ( claim.mainsnak.datavalue.value['entity-type'] != 'item' ) return undefined ;
        if ( claim.mainsnak.datavalue.value['numeric-id'] === undefined ) return undefined ;
        return 'Q'+claim.mainsnak.datavalue.value['numeric-id'] ;
    };

    this.getClaimTargetString = function ( claim ) {
        if ( claim === undefined ) return undefined ;
        if ( claim.mainsnak === undefined ) return undefined ;
        if ( claim.mainsnak.datavalue === undefined ) return undefined ;
        if ( claim.mainsnak.datavalue.type === undefined ) return undefined ;
        if ( claim.mainsnak.datavalue.type != 'string' ) return undefined ;
        return claim.mainsnak.datavalue.value ;
    };

    this.getClaimDate = function ( claim ) {
        if ( claim === undefined ) return undefined ;
        if ( claim.mainsnak === undefined ) return undefined ;
        if ( claim.mainsnak.datavalue === undefined ) return undefined ;
        if ( claim.mainsnak.datavalue.type === undefined ) return undefined ;
        if ( claim.mainsnak.datavalue.type != 'time' ) return undefined ;
        return claim.mainsnak.datavalue.value ;
    };

    this.hasClaimItemLink = function ( p , q ) {
        var self = this ;
        var ret = false ;
        q = this.wd.convertToStringArray ( q , 'Q' ) [0] ;
        var claims = self.getClaimsForProperty ( p ) ;
        $.each ( claims , function ( dummy , c ) {
            var id = self.getClaimTargetItemID ( c ) ;
            if ( id === undefined || id != q ) return ;
            ret = true ;
            return false ;
        } ) ;
        return ret ;
    };

    this.followChain = function ( o ) {
        var self = this ;
        var id = self.getID() ;
        if ( undefined === self.wd ) {
            console.log ( "ERROR : followChain for " + id + " has no wd object set!" ) ;
            return ;
        }
        if ( o.hadthat === undefined ) {
            o.hadthat = {} ;
            o.longest = [] ;
            o.current = [] ;
            o.props = self.wd.convertToStringArray ( o.props , 'P' ) ;
        }
        if ( undefined !== o.hadthat[id] ) return ;
        o.hadthat[id] = 1 ;
        o.current.push ( id ) ;
        if ( o.current.length > o.longest.length ) o.longest = $.extend(true, [], o.current);

        var tried_item = {} ;
        $.each ( o.props , function ( dummy , p ) {
            var items = self.getClaimItemsForProperty ( p ) ;
            $.each ( items , function ( dummy , q ) {
                if ( -1 != $.inArray ( q , o.current ) ) return ; // Already on that
                if ( tried_item[q] ) return ; // Only once my dear
                tried_item[q] = true ;
                self.wd.getItem(q).followChain(o) ;
            } ) ;
/*			var claims = self.getClaimsForProperty ( p ) ;
            $.each ( claims , function ( dummy , c ) {
                var q = self.getClaimTargetItemID ( c ) ;
                if ( q === undefined ) return ;
                var i = self.wd.getItem ( q ) ;
                if ( i !== undefined ) i.followChain ( o ) ;
            } ) ;*/
        } ) ;

        delete o.hadthat[this.getID()] ;
        o.current.pop() ;
        if ( o.current.length == 0 ) return o.longest ;
    }

}

function WikiData () {

    // Variables
    this.api = 'https://www.wikidata.org/w/api.php?callback=?' ;
    this.max_get_entities = 50 ;
    this.max_get_entities_smaller = 25 ;
    this.language = 'en' ; // Default
    this.main_languages = [ 'en' , 'de' , 'fr' , 'nl' , 'es' , 'it' , 'pl' , 'pt' , 'ja' , 'ru' , 'hu' , 'sv' , 'fi' ] ;
    this.items = {} ;

    this.clear = function () {
        this.items = {} ;
    };

    this.countItemsLoaded = function () {
        var self = this ;
        var ret = 0 ;
        $.each ( self.items , function ( k , v ) { if ( !v.isPlaceholder() && v.isItem() ) ret++ } ) ;
        return ret ;
    };

    this.getUnifiedID = function ( name , type ) {
        var ret = String(name).replace ( /\s/g , '' ).toUpperCase() ;
        if ( /^\d+$/.test(ret) && undefined !== type ) ret = type.toUpperCase() + ret ;
        return ret ;
    };

    this.getItem = function ( q ) {
        return this.items[this.getUnifiedID(q)] ;
    };

    this.convertToStringArray = function ( o , type ) {
        var self = this ;
        var ret = [] ;
        if ( o === undefined ) return ret ;
        if ( o instanceof Array || o instanceof Object ) {
            $.each ( o , function ( k , v ) {
                ret.push ( self.getUnifiedID(v,type) ) ;
            } ) ;
        } else {
            ret = [ self.getUnifiedID(o,type) ] ;
        }
        return ret ;
    };

    this.getLinksForItems = function ( ql , o , fallback ) {
        var self = this ;
        if ( undefined === fallback ) fallback = '' ;
        var a = [] ;
        $.each ( self.convertToStringArray ( ql , 'Q' ) , function ( dummy , q ) {
            if ( undefined === self.items[q] ) return ;
            a.push ( self.items[q].getLink ( o ) ) ;
        } ) ;
        if ( a.length == 0 ) return fallback ;
        return a.join ( '; ' ) ;
    };

    this.getCustomLabsQuery = function ( query, callback ) {
        $.getJSON(query, function (response) {
            callback(response)
        });
    };

    this.getItemBatch = function ( item_list , callback , props ) {
        var self = this ;
        if ( props === undefined ) props = 'info|aliases|labels|descriptions|claims|sitelinks|datatype' ;
        var ids = [ [] ] ;
        self.loaded_count = 0 ;
        self.loading_count = 0 ;
        var max_per_batch = item_list.length > 100 ? self.max_get_entities : self.max_get_entities_smaller ; // Smaller batch size for small list
        $.each ( item_list , function ( dummy , q ) {
            if ( typeof q == 'number' ) q = 'Q' + q ;
            if ( self.items[q] !== undefined ) return ; // Have that one
            if ( -1 != $.inArray ( q , ids ) ) return ; // Already planning to load that one
            if ( ids[ids.length-1].length >= max_per_batch ) ids.push ( [] ) ;
            ids[ids.length-1].push ( q ) ;
            self.loading_count++ ;
        } ) ;

        if ( ids[0].length == 0 ) { // My work here is done
            callback ( ids ) ;
            return ;
        }

        if ( ids.length > 1 ) {
            var last = ids.length-1 ;
            while ( ids[last].length+last <= max_per_batch && ids[last].length+last <= ids[0].length ) {
                for ( var i = 0 ; i < last ; i++ ) {
                    ids[last].push ( ids[i].pop() ) ;
                }
            }
        }

        var running = ids.length ;
        $.each ( ids , function ( dummy , id_list ) {
            $.getJSON ( self.api , {
                action : 'wbgetentities' ,
                ids : id_list.join('|') ,
                props : props ,
                format : 'json'
            } , function ( data ) {
                $.each ( (data.entities||[]) , function ( k , v ) {
                    try {
                        var q = self.getUnifiedID(k);
                        self.items[q] = new WikiDataItem(self, data.entities[q]);
                        self.loaded_count++;
                    } catch (e) {
                        console.log("Error: " + err.message + "\n" + err.stack);
                    }
                } ) ;

                if ( undefined !== self.loading_status_callback ) self.loading_status_callback ( self.loaded_count , self.loading_count ) ;

                running-- ;
                if ( running == 0 ) callback ( ids ) ;
            } ) ;
        } ) ;

    };

    this.getItemFromTitle = function ( title , callback , props ) {
        var self = this ;
        if ( props === undefined ) props = 'info|aliases|labels|descriptions|claims|sitelinks|datatype' ;
        self.loading_count = 0;
        self.loaded_count = 0;
        $.getJSON ( self.api , {
            action : 'wbgetentities' ,
            titles : title ,
            props : props ,
            redirects : 'yes',
            normalize : true,
            sites: 'enwiki',
            format : 'json'
        } , function ( data ) {
            var qarray = [];
            $.each ( (data.entities||[]) , function ( k , v ) {
                var q = self.getUnifiedID(k);
                qarray.push(q);
                self.items[q] = new WikiDataItem(self, data.entities[q]);
                self.loaded_count++;
            } ) ;

            if ( undefined !== self.loading_status_callback ) self.loading_status_callback ( self.loaded_count , self.loading_count ) ;
            callback ( qarray ) ;
        } ) ;
    };

    /**
    Loads a list of items, follows property list if given
    - item_list : array of strings/integers with item (q/p) IDs
    - params: Object
    -- follow : array (property values to follow)
    -- preload : array (property values to download items for, but not follow)
    -- preload_all_for_root : download all linked items for properties in the root element
    -- status : function ( params )
    -- loaded : function ( q , params )
    -- finished : function ( params )
    - max_depth : integer (0=no follow;1=follow 1 depth etc.) or undefined for unlimited
    */
    this.loadItems = function ( item_list , params , max_depth ) {
        var self = this ;

        if ( undefined !== max_depth ) {
            if ( max_depth < 0 ) return ;
            max_depth-- ;
        }

        // Initialize parameters, and seeds on initial run
        var first = false ;
        var download_all_linked_items = false ;
        var ql = [] ;
        if ( undefined === params ) params = {} ;
        if ( undefined === params.running ) {
            first = true ;
            if ( params.preload_all_for_root ) download_all_linked_items = true ;
            params.running = 0 ;
            params.post_load_items = [] ;
            params.preload = self.convertToStringArray ( params.preload , 'P' ) ;
            params.follow = self.convertToStringArray ( params.follow , 'P' ) ;
            ql = self.convertToStringArray ( item_list , 'Q' ) ; // 'Q' being the default, in case only integers get passed
            if ( undefined !== params.status ) params.status ( params ) ;
        } else {
            ql = item_list ;
        }

        // Run through list, and self-call where necessary
        var started = false ;
        while ( ql.length > 0 ) {
            var ids = [] ;
            while ( ids.length < self.max_get_entities && ql.length > 0 ) {
                var q = ql.shift() ;
                if ( self.items[q] !== undefined && !self.items[q].placeholder ) continue ; // Done that
                if ( self.items[q] === undefined ) self.items[q] = new WikiDataItem ( self ) ;
                ids.push ( q ) ;
            }
            if ( ids.length == 0 ) continue ;
            params.running++ ;
            started = true ;
            if ( undefined !== params.status ) params.status ( params ) ;
            var call_params = {
                action : 'wbgetentities' ,
                ids : ids.join('|') ,
//				languages : self.main_languages.join('|') ,
                props : 'info|aliases|labels|descriptions|claims|sitelinks' ,
                format : 'json'
            } ;
            if ( !first && params.languages !== undefined ) call_params.languages = params.languages ;
            $.getJSON ( self.api , call_params , function ( data ) {
                var nql = [] ;
                $.each ( (data.entities||[]) , function ( k , v ) {
                    var q = self.getUnifiedID ( k ) ;
                    self.items[q] = new WikiDataItem ( self , data.entities[q] ) ;
                    if ( undefined !== params.loaded ) params.loaded ( q , params ) ;

                    // Follow properties
                    var si = self.items[q] ;
                    var i = si.raw ;
                    $.each ( (i.claims||{}) , function ( k2 , v2 ) {
                        if ( -1 == $.inArray ( k2 , params.post_load_items ) ) params.post_load_items.push ( k2 ) ;
                    } ) ;

                    // Follow properties
                    $.each ( params.follow , function ( dummy , p ) {
                        $.each ( si.getClaimsForProperty ( p ) , function ( dummy2 , claim ) {
                            var q2 = si.getClaimTargetItemID ( claim ) ;
                            if ( undefined === q2 ) return ;
                            if ( undefined !== self.items[q2] ) return ; // Had that
                            if ( -1 != $.inArray ( q2 , nql ) ) return ; // Already on list
                            nql.push ( q2 ) ;
                        } )
                    } ) ;

                    // Add qualifiers
                    $.each ( (i.claims||{}) , function ( k2 , v2 ) {
                        $.each ( v2 , function ( k2a , v2a ) {
                            $.each ( (v2a.qualifiers||[]) , function ( k3 , v3 ) {
                                if ( -1 == $.inArray ( k3 , params.post_load_items ) ) params.post_load_items.push ( k3 ) ;
                                $.each ( v3 , function ( k4 , v4 ) {
                                    if ( undefined === v4.datavalue ) return ;
                                    if ( undefined === v4.datavalue.value ) return ;
                                    if ( undefined === v4.datavalue.value['numeric-id'] ) return ;
                                    var qualq = 'Q'+v4.datavalue.value['numeric-id'] ;
                                    if ( -1 == $.inArray ( qualq , params.post_load_items ) ) params.post_load_items.push ( qualq ) ;
                                } ) ;
                            } ) ;
                        } ) ;
                    } ) ;

                    // Add pre-load property targets to post-load list
                    var pre ;
                    if ( download_all_linked_items ) {
                        pre = self.items[q].getPropertyList() ;
                    } else pre = params.preload ;
                    $.each ( pre , function ( dummy , p ) {
                        $.each ( si.getClaimsForProperty ( p ) , function ( dummy2 , claim ) {
                            var q2 = si.getClaimTargetItemID ( claim ) ;
                            if ( undefined === q2 ) return ;
                            if ( undefined !== self.items[q2] ) return ; // Had that
                            if ( -1 != $.inArray ( q2 , params.post_load_items ) ) return ; // Already on list
                            params.post_load_items.push ( q2 ) ;
                        } )
                    } ) ;

                } ) ;
                if ( nql.length > 0 ) {
                    self.loadItems ( nql , params , max_depth ) ;
                }
                params.running-- ;
                if ( undefined !== params.status ) params.status ( params ) ;

                if ( params.running == 0 ) { // All loaded

                    if ( params.post_load_items.length > 0 ) {
                        self.loadItems ( params.post_load_items , {
                            finished : function () {
                                if ( undefined !== params.finished ) params.finished ( params ) ;
                            }
                        } , 0 ) ;
                    } else {
                        if ( undefined !== params.finished ) params.finished ( params ) ;
                    }
                }
            } ) ;
        }

        if ( first && !started ) {
            if ( undefined !== params.finished ) params.finished ( params ) ;
        }
    }

}

exports.wd = new WikiData() ;

},{}]},{},[1]);
