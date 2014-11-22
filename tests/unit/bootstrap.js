'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('../../index');

require('jii-urlmanager');

Jii.createWebApplication({
	application: {
		basePath: __dirname
	}
});
