/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');

/**
 * @class Jii.httpServer.HttpServer
 * @extends Jii.base.Component
 */
Jii.defineClass('Jii.httpServer.HttpServer', {
	
	__extends: Jii.base.Component,

    host: '0.0.0.0',
    port: 3000,

    /**
     * @type {Jii.urlManager.UrlManager|string}
     */
    urlManager: 'urlManager',

    /**
     * @type {string|string[]|object}
     */
    staticDirs: null,

    _express: null,
    _server: null,
    _isExpressSubscribed: false,

    init: function () {
        this._express = new express();
        this._express.use(bodyParser.json()); // for parsing application/json
        this._express.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
        this._express.use(multer()); // for parsing multipart/form-data

        // Static files
        if (Jii._.isString(this.staticDirs)) {
            this.staticDirs = [this.staticDirs];
        }
        Jii._.each(this.staticDirs || [], function(dir) {
            this._express.use(express.static(dir));
        }.bind(this));

        if (Jii._.isString(this.urlManager)) {
            this.urlManager = Jii.app.getComponent(this.urlManager);
        }
    },

    /**
     * Start listen http queries
     */
    start: function () {
        // Subscribe on all requests
        if (!this._isExpressSubscribed) {
            this._isExpressSubscribed = true;
            this._express.all('*', this._onRoute.bind(this));
        }

        Jii.info('Start http server, listening `' + this.host + ':' + this.port + '`.');
        this._server = http.createServer(this._express).listen(this.port, this.host);
    },

    /**
     * Stop listen http port
     */
    stop: function (c) {
        this._server.close(c);
        Jii.info('Http server is stopped.');
    },

    /**
     * @param {object} expressRequest
     * @param {object} expressResponse
     * @private
     */
    _onRoute: function (expressRequest, expressResponse) {
        var request = new Jii.httpServer.Request(expressRequest);
        var result = this.urlManager.parseRequest(request);
        if (result !== false) {
            var route = result[0];
            var params = result[1];

            // Append parsed params to request
            var queryParams = request.getQueryParams();
            request.setQueryParams(Jii._.extend(queryParams, params));

			// Create response component
			var response = new Jii.httpServer.Response(expressResponse);

			// Create context
			var context = Jii.createContext();
			context.setComponent('request', request);
			context.setComponent('response', response);

            Jii.app.runAction(route, context);
            return;
        }

        //throw new Jii.exceptions.InvalidRouteException(Jii.t('jii', 'Page not found.'));
        Jii.info('Page not found.');
    }
});
