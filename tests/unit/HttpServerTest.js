'use strict';

var Jii = require('jii');
var Response = require('jii-httpserver/server/Response');
var HttpServer = require('jii-httpserver/server/HttpServer');
var UnitTest = require('jii/base/UnitTest');
var UrlManager = require('jii-urlmanager/UrlManager');
var request = require('request');
var SiteController = require('../controllers/SiteController');

require('../bootstrap');

/**
 * @class tests.unit.HttpServerTest
 * @extends Jii.base.UnitTest
 */
var HttpServerTest = Jii.defineClass('tests.unit.HttpServerTest', {

	__extends: UnitTest,

	__static: {
		SERVER_PORT: 3300
	},

	init: function() {
		Jii.app.setComponents({
			urlManager: {
				className: UrlManager,
				rules: {
					'': 'site/index',
					'test/<page>': 'site/test'
				}
			},
			httpServer: {
				className: HttpServer,
				port: this.__static.SERVER_PORT
			}
		});
	},

	setUp: function(callback) {
		Jii.app.httpServer.start();
		this.__super(callback);
	},

	tearDown: function(callback) {
		Jii.app.httpServer.stop();
		this.__super(callback);
	},

	echoTest: function (test) {
		var testValue = new Date().getTime();
		request('http://localhost:' + this.__static.SERVER_PORT + '/?testParam=' + testValue, function(err, response, body) {
			test.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8');
			test.strictEqual(body, 'test' + testValue);

			test.done();
		});
	},

	requestTest: function (test) {
		var testValue = new Date().getTime();
		SiteController.prototype.actionTest = function(context) {
			var request = context.getComponent('request');
			var response = context.getComponent('response');

			test.strictEqual(request.getMethod(), 'GET');
			test.strictEqual(request.isAjax(), false);
			test.strictEqual(request.getBaseUrl(), '/');
			test.strictEqual(request.getHostInfo(), 'http://localhost:3300');
			test.strictEqual(request.getAbsoluteUrl(), 'http://localhost:3300/test/50?param1=' + testValue);
			test.strictEqual(request.getUrl(), '/test/50?param1=' + testValue);
			test.strictEqual(request.getQueryString(), 'param1=' + testValue);
			test.strictEqual(request.getServerName(), 'localhost');
			test.strictEqual(request.getServerPort(), 3300);
			test.strictEqual(request.getReferrer(), 'https://github.com/jiisoft/jii');
			test.strictEqual(request.getUserAgent(), 'Mozilla/5.0 (compatible; NodeUnit/2.0)');
			test.strictEqual(request.getUserIP(), '152.68.13.4');
			test.strictEqual(request.get('param1'), testValue.toString());
			test.strictEqual(request.get('page'), '50');

			response.format = Response.FORMAT_JSON;
			response.data = {jp: 15};
			response.send();
		};

		request({
			url: 'http://localhost:' + this.__static.SERVER_PORT + '/test/50?param1=' + testValue,
			headers: {
				'referer': 'https://github.com/jiisoft/jii',
				'user-agent': 'Mozilla/5.0 (compatible; NodeUnit/2.0)',
				'x-real-ip': '152.68.13.4'
			}
		}, function(err, response, body) {
			test.strictEqual(response.headers['content-type'], 'application/json; charset=utf-8');

			test.done();
		});
	}

});

module.exports = new HttpServerTest().exports();
