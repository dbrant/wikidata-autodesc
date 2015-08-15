
'use strict';

var BBPromise = require('bluebird');
var preq = require('preq');
var sUtil = require('../lib/util');
var util = require('util');
var autodesc = require('../lib/auto_long_desc');

/**
 * The main router object
 */
var router = sUtil.router();

/**
 * The main application object reported when this module is require()d
 */
var app;

/**
 * GET {domain}/v1/description/{Qnn}
 * Gets an autogenerated description for the specified Q-number.
 */
router.get('/:qnum', function (req, res) {
    var params = {
	    q: req.params.qnum,
		lang: "en",
        mode: "short",
        links: "text"
	};

	autodesc.getDescription ( params , function ( text ) {
		var j = {
			call : params,
			q : params.q,
			label : autodesc.wd.items[params.q].getLabel(params.lang) ,
			manual_description : autodesc.wd.items[params.q].getDesc(params.lang) ,
			result : text
		};
		res.status(200).json(j).end();
	});
});

module.exports = function (appObj) {
    app = appObj;
    return {
        path: '/description',
        api_version: 1,
        router: router
    };
};

