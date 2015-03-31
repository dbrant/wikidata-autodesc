/* This script can display automated Wikidata item descriptions.

DEV WARNING: The code hosted here also runs OUTSIDE of mediawiki scopes on toollabs.
Thus if you need something from the MediaWiki context, wrap your code in a check
for the wd_auto_desc.mediawiki boolean.

USERS:

To add this to your common.js page:

  mw.loader.load("//en.wikipedia.org/w/index.php?title=MediaWiki:Wdsearch-autodesc.js&action=raw&ctype=text/javascript");

On Wikidata, to always show the automatic description, even if there is a manual one, add the following line to your common.js page:

  wd_auto_desc_wd_always_show = true ;

// PROGRAMMER ACCESS
// Get a single item label

wd_auto_desc.labelItem ( "Q123" , function ( label ) {
	 // "label" now contains the item label
} ) ;



// Get a description

wd_auto_desc.loadItem ( "Q123" , {
	target:$('#desc') , // OPTIONAL: item to put the resulting HTML into
	callback : function ( q , html , opt ) { // OPTIONAL: callback with the resulting HTML
		// q is the original item ID ("Q123"), html contains the description
	} ,
	links : 'wikidata' , // OPTIONAL: 'wikidata' for links to wikidata, 'wikipedia' for links to the current language wikipedia (plain text otherwise)
	linktarget : '_blank' // OPTIONAL: For links, <a target='linktarget'>

} ) ;


// ON WIKIDATA :

To load, but not run automatically, set

var prevent_wd_auto_desc = 1 ;

BEFORE including the script

*/

var wd_auto_desc = {

	api : '//www.wikidata.org/w/api.php' ,
	q_prefix : 'Q' ,
	p_prefix : 'P' ,
	running : false ,
	color_not_found : '#FFFFC8' ,
	lang : 'en' , // Default fallback
	mediaWiki: ( typeof mw !== 'undefined' ),

	init : function () {
		var self = this;
		if ( self.mediaWiki ) {
			self.lang = mw.config.get( 'wgUserLanguage' );
		}
	} ,


// LANGUAGE-SPECIFIC DATA AND METHODS

	stock : {
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
		'BC' : { en:'BC', el:'π.Χ.', vi:'TCN' , fr:'avant Jésus-Christ', nl:'A.D.', pl:'p.n.e.' }
	} ,

	language_specific : {
		en : {
			'nationality' : {'Ecuador':'Ecuadorian','Ghana':'Ghanaian','Russia':'Russian','Argentina':'Argentine','Australia':'Australian','Austria':'Austrian','Belgium':'Belgian','Brazil':'Brazilian','Canada':'Canadian','Chile':'Chilean','China':'Chinese','Denmark':'Danish','Finland':'Finnish','Faroe Islands':'Faroese','Netherlands':'Dutch','Puerto Rico':'Puerto Rican','France':'French','Luxembourg':'Luxembourgish','Germany':'German','Greece':'Greek','Holland':'Dutch','Hungary':'Hungarian','Iceland':'Icelander','India':'Indian','Iran':'Iranian','Iraq':'Iraqi','Ireland':'Irish','Israel':'Israeli','Indonesia':'Indonesian','Italy':'Italian','Japan':'Japanese','Jamaica':'Jamaican','Jordan':'Jordanian','Mexico':'Mexican','Nepal':'Nepalese','New Zealand':'New Zealander','Norway':'Norwegian','Pakistan':'Pakistani','Paraguay':'Paraguayan','Peru':'Peruvian','Poland':'Polish','Romania':'Romanian','Scotland':'Scottish','South Africa':'South African','Spain':'Spanish','Switzerland':'Swiss','Syria':'Syrian','Thailand':'Thai','Turkey':'Turkish','USA':'American','Uruguay':'Uruguayan','Venezuela':'Venezuelan','Wales':'Welsh','United Kingdom':'British','United States of America':'US-American','Sweden':'Swedish'}
		} ,
		de : {
			'nationality' : { 'Russland':'Russisch','Dänemark':'Dänisch','Norwegen':'Norwegisch','Niederlande':'Niederländisch','Deutschland':'Deutsch','Rumänien':'Rumänisch','Chile':'Chilenisch','Brasilien':'Brasilianisch' }
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

	txt : function ( k ) {
		if ( undefined !== this.stock[k] ) {
			if ( undefined !== this.stock[k][wd_auto_desc.lang] ) return this.stock[k][wd_auto_desc.lang] ;
			return this.stock[k]['en'] ;
		}
		return '???' ;
	} ,

	txt2 : function ( t , k ) {
		if ( this.language_specific[wd_auto_desc.lang] === undefined ) return t ;
		if ( this.language_specific[wd_auto_desc.lang][k] === undefined ) return t ;

		var m = t.match ( /^(<a.+>)(.+)(<\/a>)/ ) ;
		if ( null === m ) m = [ '' , '' , t , '' ] ;
		var k2 = m[2] ;

		if ( this.language_specific[wd_auto_desc.lang][k][k2] === undefined ) return t ;
		return m[1] + this.language_specific[wd_auto_desc.lang][k][k2] + m[3] ;
	} ,

	modifyWord : function ( word , hints ) {
		var self = this ;
		if ( wd_auto_desc.lang == 'en' ) {
			if ( hints.is_female ) {
				if ( word.toLowerCase() == 'actor' ) return 'actress' ;
				if ( word.toLowerCase() == 'actor / actress' ) return 'actress' ;
			} else if ( hints.is_male ) {
				if ( word.toLowerCase() == 'actor / actress' ) return 'actor' ;
			}
		} else if ( wd_auto_desc.lang == 'fr' ) {
			if ( hints.is_female ) {
				if ( word.toLowerCase() == 'acteur' ) return 'actrice' ;
				if ( word.toLowerCase() == 'être humain' ) return 'personne' ;
			}
		} else if ( wd_auto_desc.lang == 'de' ) {
			if ( hints.is_female ) {
				if ( hints.occupation ) {
					word += 'in' ;
				}
			}
		}
		return word ;
	} ,

	listWords : function ( olist , hints ) {
		var self = this ;
		var list = $.merge ( [] , olist ) ;
		if ( hints !== undefined ) {
			$.each ( list , function ( k , v ) {
				list[k] = self.modifyWord ( v , hints ) ;
			} ) ;
		}
		if ( wd_auto_desc.lang == 'en' ) {
			if ( list.length == 1 ) return list[0] ;
			if ( list.length == 2 ) return list[0] + ' and ' + list[1] ;
			var last = list.pop() ;
			return list.join ( ', ' ) + ', and ' + last ;
		} else if ( wd_auto_desc.lang == 'de' ) {
			if ( list.length == 1 ) return list[0] ;
			if ( list.length == 2 ) return list[0] + ' und ' + list[1] ;
			var last = list.pop() ;
			return list.join ( ', ' ) + ' und ' + last ;
		} else if ( wd_auto_desc.lang == 'fr' ) {
			if ( list.length == 1 ) return list[0] ;
			if ( list.length == 2 ) return list[0] + ' et ' + list[1] ;
			var last = list.pop() ;
			return list.join ( ', ' ) + ' et ' + last ;
		} else if ( wd_auto_desc.lang == 'nl' ) {
			if ( list.length == 1 ) return list[0] ;
			if ( list.length == 2 ) return list[0] + ' en ' + list[1] ;
			var last = list.pop() ;
			return list.join ( ', ' ) + ' en ' + last ;
		} else if ( wd_auto_desc.lang == 'vi' ) {
			if ( list.length == 1 ) return list[0] ;
			if ( list.length == 2 ) return list[0] + ' và ' + list[1] ;
			var last = list.pop() ;
			return list.join ( ', ' ) + ', và ' + last ;
		} else return list.join ( ', ' ) ;
	} ,

	ucFirst : function ( s ) {
		return s.substr(0,1).toUpperCase() + s.substr(1,s.length) ;
	} ,

	getNationalityFromCountry : function ( country , claims , hints ) {
		var self = this ;
		if ( hints === undefined ) hints = {} ;
		if ( wd_auto_desc.lang == 'en' ) {
			return self.txt2 ( country , 'nationality' ) ;
		} else if ( wd_auto_desc.lang == 'de' ) {
			var n = self.txt2 ( country , 'nationality' ) ;
			if ( self.language_specific[wd_auto_desc.lang]['nationality'][country] === undefined ) return n ;
			var is_female = self.hasPQ ( claims , 21 , 6581072 ) ;
			if ( hints.not_last ) n += '' ;
			else if ( is_female ) n += 'e' ;
			else n += 'er' ;
			return n ;
		} else {
			return self.txt2 ( country , 'nationality' ) ;
		}
	} ,

	isPerson : function ( claims ) {
		var self = this ;
		if ( self.hasPQ ( claims , 107 , 215627 ) ) return true ; // GND:Person
		if ( self.hasPQ ( claims , 31 , 5 ) ) return true ; // Instance of: human
		return false ;
	} ,

	describePerson : function ( q , claims , opt ) {
		var self = this ;
		var load_items = [] ;
		self.addItemsFromClaims ( claims , 106 , load_items ) ; // Occupation
		self.addItemsFromClaims ( claims , 39 , load_items ) ; // Office
		self.addItemsFromClaims ( claims , 27 , load_items ) ; // Country of citizenship
		self.addItemsFromClaims ( claims , 166 , load_items ) ; // Award received
		self.addItemsFromClaims ( claims , 31 , load_items ) ; // Instance of
		self.addItemsFromClaims ( claims , 22 , load_items ) ; // Father
		self.addItemsFromClaims ( claims , 25 , load_items ) ; // Mother
		self.addItemsFromClaims ( claims , 26 , load_items ) ; // Spouse
		self.addItemsFromClaims ( claims , 463 , load_items ) ; // Member of

		var is_male = self.hasPQ ( claims , 21 , 6581097 ) ;
		var is_female = self.hasPQ ( claims , 21 , 6581072 ) ;

		self.labelItems ( load_items , function ( item_labels ) {
			var h = [] ;

			// Nationality
			var h2 = '' ;
			var tmp = item_labels[27]||[] ;
			$.each ( tmp , function ( k , v ) {
				var s = self.getNationalityFromCountry ( v , claims , { not_last:(k+1!=tmp.length) } ) ;
				if ( k == 0 ) h2 = s ;
				else h2 += '-' + s.toLowerCase() ; // Multi-national
			} ) ;
			if ( h2 != '' ) h.push ( h2 ) ;

			// Occupation
			var ol = h.length ;
			self.add2desc ( h , item_labels , [ 31 , 106 ] , { hints:{is_male:is_male,is_female:is_female,occupation:true,o:opt} } ) ;
			if ( h.length == ol ) h.push ( self.txt('person') ) ;

			// Office
			self.add2desc ( h , item_labels , [ 39 ] , { hints:{is_male:is_male,is_female:is_female,office:true} , prefix:',',o:opt } ) ;


			// Dates
			var born = self.getYear ( claims , 569 ) ;
			var died = self.getYear ( claims , 570 ) ;
			if ( born != '' && died != '' ) {
				h.push ( ' (' + born + '&ndash;' + died + ')' ) ;
			} else if ( born != '' ) {
				h.push ( ' (*' + born + ')' ) ;
			} else if ( died != '' ) {
				h.push ( ' (&dagger;' + died + ')' ) ;
			}

			self.add2desc ( h , item_labels , [ 166 ] , { prefix:';',o:opt } ) ;

			self.add2desc ( h , item_labels , [ 463 ] , { prefix:';' , txt_key:'member of',o:opt } ) ;

			self.add2desc ( h , item_labels , [ 22,25 ] , { prefix:';' , txt_key:'child of',o:opt } ) ;

			self.add2desc ( h , item_labels , [ 26 ] , { prefix:';' , txt_key:'spouse of',o:opt } ) ;

			if ( h.length == 0 ) h.push ( self.txt('person') ) ;

			if ( self.hasPQ ( claims , 21 , 6581072 ) ) h.push ( '♀' ) ; // Female
			if ( self.hasPQ ( claims , 21 , 6581097 ) ) h.push ( '♂' ) ; // Male

			self.setTarget ( opt , self.ucFirst ( h.join(' ') ) , q ) ;
		} , opt ) ;

	} ,

	describeGeneric : function ( q , claims , opt ) {
		var self = this ;
		var load_items = [] ;
		self.addItemsFromClaims ( claims , 361 , load_items ) ; // Part of
		self.addItemsFromClaims ( claims , 279 , load_items ) ; // Subclass off
		self.addItemsFromClaims ( claims , 31 , load_items ) ; // Instance of
		self.addItemsFromClaims ( claims , 60 , load_items ) ; // Astronomical object

		self.addItemsFromClaims ( claims , 175 , load_items ) ; // Performer
		self.addItemsFromClaims ( claims , 86 , load_items ) ; // Composer
		self.addItemsFromClaims ( claims , 170 , load_items ) ; // Creator
		self.addItemsFromClaims ( claims , 57 , load_items ) ; // Director
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

		self.labelItems ( load_items , function ( item_labels ) {
			var h = [] ;
			var h2 , x ;

			// Date
			var pubdate = self.getYear ( claims , 577 ) ;
			if ( pubdate != '' ) h.push ( pubdate ) ;

			// Instance/subclass/etc
			self.add2desc ( h , item_labels , [ 279,31,60,105 ] , { o:opt } ) ;

			// Location
			h2 = [] ;
			$.each ( item_labels[131]||[] , function ( k , v ) { h2.push ( v ) ; } ) ;
			var sep = ' / ' ;
			var h3 = [] ;
			$.each ( item_labels[17]||[] , function ( k , v ) { h3.push ( v ) ; } ) ;
			if ( h.length == 0 && ( h2.length > 0 || h3.length > 0 ) ) h.push ( self.txt('location') ) ;
			if ( h2.length > 0 && h3.length > 0 ) h.push ( self.txt('in') + ' ' + h2.join(sep) + ", " + h3.join(sep) ) ;
			else if ( h2.length > 0 ) h.push ( self.txt('in') + ' ' + h2.join(sep) ) ;
			else if ( h3.length > 0 ) h.push ( self.txt('in') + ' ' + h3.join(sep) ) ;

			// Creator etc.
			self.add2desc ( h , item_labels , [ 175,86,170,57,50,61 ] , { txt_key:'by',o:opt } ) ;
			self.add2desc ( h , item_labels , [ 306,400 ] , { txt_key:'for',o:opt } ) ;
			self.add2desc ( h , item_labels , [ 264,123 ] , { txt_key:'from',o:opt } ) ;
			self.add2desc ( h , item_labels , [ 361 ] , { prefix:',' , txt_key:'part of',o:opt } ) ;
			self.add2desc ( h , item_labels , [ 138 ] , { prefix:',' , txt_key:'named after',o:opt } ) ;

			// Origin (group of humans, organizations...)
			h2 = [] ;  $.each ( item_labels[159]||[] , function ( k , v ) { h2.push ( v ) ; } ) ;
			h3 = [] ;  $.each ( item_labels[495]||[] , function ( k , v ) { h3.push ( v ) ; } ) ;
			if ( h2.length > 0 && h3.length > 0 ) h.push ( self.txt('from') + ' ' + h2.join(sep) + ", " + h3.join(sep) ) ;
			else if ( h2.length > 0 ) h.push ( self.txt('from') + ' ' + h2.join(sep) ) ;
			else if ( h3.length > 0 ) h.push ( self.txt('from') + ' ' + h3.join(sep) ) ;

			// Fallback
			if ( h.length == 0 ) {
				h = '<i>'+self.txt('cannot_describe')+'</i>' ;
				if ( opt.fallback == 'manual_desc' && self.main_data.descriptions !== undefined && self.main_data.descriptions[self.lang] !== undefined ) {
					h = self.main_data.descriptions[self.lang].value ;
				}
				if ( opt.target !== undefined ) opt.target.css({'background-color':self.color_not_found}) ;
			} else h = self.ucFirst ( h.join ( ' ' ) ) ;
			self.setTarget ( opt ,  h , q ) ;
		} , opt ) ;
	} ,

	add2desc : function ( h , item_labels , props , opt ) {
		if ( undefined === opt ) opt = {} ;
		var self = this ;
		var h2 = [] ;
		var x = [] ;
		$.each ( props , function ( k , prop ) {
			$.merge ( x , item_labels[prop]||[] ) ;
		} ) ;
		$.each ( x , function ( k , v ) { h2.push ( v ) ; } ) ;
		if ( h2.length > 0 ) {
			if ( undefined !== opt.prefix && h.length > 0 ) h[h.length-1] += opt.prefix ;
			var s = self.listWords ( h2 , opt.hints ) ;
			if ( undefined !== opt.txt_key ) s = self.txt(opt.txt_key) + ' ' + s ;
			h.push ( s ) ;
		}
	} ,

	loadItemForPage : function ( site , page , opt ) {
		var self = this ;

		$.getJSON ( self.api+'?action=wbgetentities&format=json&sites='+site+'&titles='+encodeURIComponent(page)+'&normalize=&callback=?' , function ( d ) {

			if ( d.success != 1 ) {
				mw.log( "Failed to load item for page: ", d );
				return self.setTarget ( opt , '<i>'+self.txt('query_error')+'</i>' , site+':'+page );
			}
			if ( d.entities === undefined ) return self.setTarget ( opt , '<i>'+self.txt('not_found')+'</i>' , site+':'+page ) ;

			var q ;
			$.each ( d.entities , function ( k , v ) { q = k } ) ;
			opt.q = q ;
			self.main_data = d.entities[q] ;
			var claims = d.entities[q].claims || [] ;

			if ( self.isPerson ( claims ) ) self.describePerson ( q , claims , opt ) ;
			else if ( self.isDisambig ( claims ) ) self.setTarget ( opt , self.txt('disambig') , q ) ;
			else return self.describeGeneric ( q , claims , opt ) ;

		} ) ;

	} ,

	loadItem : function ( q , opt ) {
		var self = this ;
		q = q.toUpperCase() ;
		opt.q = q ;

		if ( undefined !== self.cache[q] && undefined === opt.skip_cache ) return self.setTarget ( opt , self.cache[q] , q ) ;

		$.getJSON ( self.api+'?action=wbgetentities&format=json&ids='+q+'&callback=?' , function ( d ) {
			if ( d.success != 1 ) {
				mw.log( "Failed to load item for page: ", d );
				return self.setTarget ( opt , '<i>'+self.txt('query_error')+'</i>' , q ) ;
			}
			if ( d.entities === undefined || d.entities[q] === undefined ) return self.setTarget ( opt , '<i>'+self.txt('not_found')+'</i>' , q ) ;
			self.main_data = d.entities[q] ;
			var claims = d.entities[q].claims || [] ;

			if ( self.isPerson ( claims ) ) self.describePerson ( q , claims , opt ) ;
			else if ( self.isDisambig ( claims ) ) self.setTarget ( opt , self.txt('disambig') , q ) ;
			else return self.describeGeneric ( q , claims , opt ) ;

		} ) ;

	} ,

	isDisambig : function ( claims ) {
		var self = this ;
		return ( self.hasPQ ( claims , 107 , 11651459 ) ) ;
	} ,

	hasPQ : function ( claims , p , q ) { // p,q numerical
		var self = this ;
		p = self.p_prefix+p ;
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

	getYear : function ( claims , p ) { // p numerical
		var self = this ;
		p = self.p_prefix+p ;
		if ( undefined === claims[p] ) return '' ;
		var ret = '' ;
		$.each ( claims[p] , function ( k , v ) {
			if ( undefined === v.mainsnak ) return ;
			if ( undefined === v.mainsnak.datavalue ) return ;
			if ( undefined === v.mainsnak.datavalue.value ) return ;
			if ( undefined === v.mainsnak.datavalue.value['time'] ) return ;
			var m = v.mainsnak.datavalue.value['time'].match ( /^([+-])0+(\d+)/ ) ;
			if ( m == null ) return ;
			ret = m[2] ;
			if ( m[1] == '-' ) ret += self.txt('BC') ;
		} ) ;
		return ret ;
	} ,


	labelItems : function ( items , callback , opt ) {
		var self = this ;

		if ( undefined === opt ) opt = {} ;

		if ( items.length == 0 ) {
			callback ( {} ) ;
			return ;
		}

		var i = [] ;
		$.each ( items , function ( k , v ) {
			i.push ( v[1] ) ;
		} ) ;

		var additional = '' ;
		if ( opt.links != '' && opt.links != 'reasonator_local' && opt.links != 'reasonator' ) additional += '|sitelinks' ;

		$.getJSON ( self.api+'?action=wbgetentities&format=json&props=labels'+additional+'&ids='+i.join('|')+'&callback=?' , function ( d ) { // &languages='+wd_auto_desc.lang+'
			var cb = {} ;
			$.each ( d.entities||[] , function ( q , v ) {
				if ( v.labels === undefined ) return ;
				var curlang = wd_auto_desc.lang ; // Try set language
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
				var p ;
				$.each ( items , function ( k , v ) {
					if ( v[1] == q ) p = v[0] ;
				} ) ;

				if ( q == 'Q5' && p == 31 ) return ; // Instance of: human

				if ( cb[p] === undefined ) cb[p] = [] ;

				var label = v.labels[curlang].value ;
				var linktarget = (opt.linktarget===undefined?'':" target='"+opt.linktarget+"'") ;
				if ( opt.links == 'wikidata' ) {
					cb[p].push ( "<a href='//www.wikidata.org/wiki/"+ q + "'" + linktarget +">" + label + "</a>" ) ;
				} else if ( opt.links == 'reasonator_local' ) {
					cb[p].push ( "<a href='?lang="+opt.reasonator_lang+"&q="+ q + "'" + linktarget +">" + label + "</a>" ) ;
				} else if ( opt.links == 'reasonator' ) {
					cb[p].push ( "<a href='/reasonator/?lang="+opt.reasonator_lang+"&q="+ q + "'" + linktarget +">" + label + "</a>" ) ;
				} else if ( opt.links == 'wikipedia' && undefined !== v.sitelinks && undefined !== v.sitelinks[self.lang+'wiki'] ) {
					var page = mw.util.wikiUrlencode ( v.sitelinks[self.lang+'wiki'].title ) ;
					if ( opt.local_links ) cb[p].push ( "<a href='/wiki/"+ page + "'" + linktarget +">" + label + "</a>" ) ;
					 else cb[p].push ( "<a href='//"+self.lang+".wikipedia.org/wiki/"+ page + "'" + linktarget +">" + label + "</a>" ) ;
				} else if ( opt.links != '' && undefined !== v.sitelinks && undefined !== v.sitelinks[self.lang+opt.links] ) {
					var page = mw.util.wikiUrlencode ( v.sitelinks[self.lang+opt.links].title ) ;
					if ( opt.local_links ) cb[p].push ( "<a href='/wiki/"+ page + "'" + linktarget +">" + label + "</a>" ) ;
					 else cb[p].push ( "<a href='//"+self.lang+"."+opt.links+".org/wiki/"+ page + "'" + linktarget +">" + label + "</a>" ) ;
				} else cb[p].push ( label ) ;
			} ) ;
			callback ( cb ) ;
		} ) ;
	} ,

	labelItem : function ( q , callback ) {
		this.labelItems ( [ [0,q] ] , function ( item_labels ) {
			callback ( ((item_labels||[])[0]||[])[0] ) ;
		} ) ;
	} ,

	setTarget : function ( opt , html , q ) {
		var self = this ;
		if ( q !== undefined && undefined === self.cache[q] ) self.cache[q] = html ;
		if ( undefined !== opt.target ) opt.target.html ( html ) ;
		if ( undefined !== opt.callback ) opt.callback ( q , html , opt ) ;
	} ,



	cache : {}

} ;

wd_auto_desc.init() ;

var wd_auto_desc_wd = {

	always_show : false ,
	style : 'background-color:#DBEBFF;padding:2px' ,

	init : function () {
		var self = this ;
		if ( typeof(wd_auto_desc_wd_always_show) != 'undefined' ) self.always_show = wd_auto_desc_wd_always_show ;
		self.interval = setInterval ( wd_auto_desc_wd.check_dom , 500 ) ;
		self.check_search_results () ;
//		setInterval ( wd_auto_desc.check_search_results , 1000 ) ;
	} ,

	check_search_results : function () {
		var self = this ;
		$('div.mw-search-result-heading').each ( function ( k , o ) {
			var manual_description = $($(o).find('span.wb-itemlink-description')) ;
			var has_manual_description = manual_description.length > 0 ;
			if ( !self.always_show && has_manual_description ) return ; // Do not run if manual description is already there
			var href = $($(o).find('a')).attr('href') ;
			if ( href === undefined ) return ;

			var h = '<span class="wb-itemlink-description autodesc-itemlink-description" style="' + self.style + '"><i>' + wd_auto_desc.txt('generating_auto_content') + '</i></span>' ;
			if ( has_manual_description ) manual_description.prepend ( h+' / ' ) ;
			else $(o).append ( ': ' + h ) ;
			var q = href.split('/').pop() ;
			wd_auto_desc.loadItem ( q , { target:$($(o).find('span.autodesc-itemlink-description')),links:'wikidata',linktarget:'_blank' } ) ;


		} ) ;
	} ,



	check_dom : function () {
		var self = wd_auto_desc_wd ;
		if ( self.running ) return ;
		self.running = true ;

		$( '.ui-ooMenu-item' ).each ( function ( k , v ) {
			var data = $(v).data('uiOoMenuItem')._entityStub ;
			if ( typeof data == 'undefined' ) return ;
			if ( undefined === data ) return ;
			if ( undefined === data.id ) return ;
			if ( data.id.substr ( 0 , 1 ) != wd_auto_desc.q_prefix ) return ;
			var q = data.id ;

			var o = $(v).find('span.ui-entityselector-itemcontent').get(0) ;
			var manual_description = $($(o).find('span.ui-entityselector-description')) ;
			if ( !self.always_show && manual_description.length > 0 ) return ;
			if ( $($(o).find('.autodesc-entityselector-description')).length > 0 ) return ; // HAD THAT

			var h = "<span class='ui-entityselector-description autodesc-entityselector-description' style='"+self.style+"'><i>" + wd_auto_desc.txt('generating_auto_content') + "</i></span>" ; //
			$(o).append ( h ) ;
			var target = $($(o).find('.autodesc-entityselector-description')) ;
			wd_auto_desc.loadItem ( q , { target : target , callback : function () {
				$(target).find('a').css({display:'inline-block'}) ;
			} } ) ;
		} ) ;
		self.running = false ;
	} ,

	fin : 0

} ;

if (typeof mw !== 'undefined' && typeof prevent_wd_auto_desc === 'undefined' ) { // On Wikidata
	$(document).ready( function() {
		if ( mw.config.get('wgSiteName') != 'Wikidata' ) return ;
		if ( mw.config.get('wgNamespaceNumber') > 0 ) return ;
		if ( mw.config.get('wgAction') != 'view' ) return ;
		wd_auto_desc_wd.init() ;
	} ) ;
}