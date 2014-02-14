/**
 * Llama
 */
var Llama = {
    include: function(src, callback) {
        var script = document.createElement('script');
        script.src = src;
        script.onload = function(ev) {
            if (typeof callback === 'function') {
                callback();
            }
        };

        document.getElementsByTagName('head')[0].appendChild(script);
    }
};





/**
 * Application
 */
Llama.Application = function LlamaApplication(options) {
    /* Creating app attributes */
    this.path = 'app/';
    this.name = 'MyApp';
    this.controllers = 'Index';
    this.renderTo = 'app';
    $.extend(this, options);

    /* Instancing the app controllers */
    if (typeof this.controllers == 'string') {
        this.controllers = [this.controllers];
    }

    this._controllers = this.controllers;
    this._loaded = 0;
    this.controllers = {};
    var controllerPath = this.path + 'controllers/';

    if (typeof this._controllers === 'object') {
        for (i in this._controllers) {
            var _this = this;
            Llama.include(controllerPath + this._controllers[i], function() {
                _this._loaded++;

                if (_this._loaded == _this._controllers.length) {
                    /* Finished loaded the controllers, fire up the ready event */
                    delete _this._loaded;
                    delete _this._controllers;

                    if (typeof _this.ready === 'function'){                        
                        _this.ready();
                    };
                }
            });
        }
    }

    /* Done */
    console.log('Application created');
    console.groupEnd();
};





/**
 * Controller
 */
Llama.Controller = function LlamaController(opt) {
    this.views = {};
    $.extend(this, opt);
}
/* Llama.Controller.prototype.getView = function(src, callback) {
    if (typeof this.views[src] == 'undefined') {
        var _this = this;
        var _name = src;
        src = this.app.path + "views/" + this.name + "/" + src + ".tpl"
        console.group('Including view in ' + src);
        console.log('Including view ' + src);
    
        $.ajax(src, {
            complete: function(data, msg) {
                if (msg == 'success') {
                    var view = new Llama.View(data.responseText, _this)
                    _this.views[_name] = view;
                    callback(view);
                    console.log('View ' + src + ' included');
                }
            } 
        });

        console.groupEnd();
    } else {
        callback(this.views[src]);
    }
} */





/**
 * View
 */
Llama.View = function(data, controller) {
    this.template = data;
    this.handlebars = Handlebars.compile(data);
    this.controller = controller;
}
Llama.View.prototype.render = function(data) {
    $('#' + this.controller.app.renderTo).html(
        this.handlebars(data)
    );
}

console.debug('Llama is ready');