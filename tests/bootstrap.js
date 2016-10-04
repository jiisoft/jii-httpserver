'use strict';

var Jii = require('jii');
var SiteController = require('./controllers/SiteController');

Jii.createWebApplication({
	application: {
		basePath: __dirname,
		controllerMap: {
			SiteController: SiteController
		}
	}
});