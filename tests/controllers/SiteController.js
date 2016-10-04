'use strict';

var Jii = require('jii');
var Controller = require('jii/base/Controller');

module.exports = Jii.defineClass('app.controllers.SiteController', {

    __extends: Controller,

    actionIndex: function(context) {
        var request = context.getComponent('request');
        var response = context.getComponent('response');

        response.data = 'test' + request.get('testParam');
        response.send();
    }

});