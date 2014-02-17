/**
 * Llama
 */
var Llama = {
    include: function(src, callback) {
        /* Create the script object */
        var script = document.createElement('script');
        script.src = src;
        script.onload = function(ev) {
            if (typeof callback === 'function') {
                callback();
            }
        };

        /* Put it on the DOM */
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

                    if (typeof _this.ready === 'function') {
                        /* Attach parent */
                        for (i in _this.controllers) {
                            _this.controllers[i].app = _this;
                        }

                        /* Fire ready event */
                        _this.ready();
                    };
                }
            });
        }
    }

    /* Attach routers */
    this._routes = this.routes;
    this.routes = [];

    if (typeof this._routes === 'object') {
        for (i in Object.keys(this._routes)) {
            var key = Object.keys(this._routes)[i];
            var router = new Llama.Router(key, this._routes[key]);
            this.routes.push(router);
            console.log(router);
        }
    }

    delete this._routes;

    var _this = this;
    window.onpopstate = function(ev) {
        if (window.location.hash != '') {
            var request = false;

            for (i in _this.routes) {
                if (request = _this.routes[i].match(window.location.hash.substr(1))) {
                    _this.controllers[request.controller][request.action](request);
                }
            }            
        }
    };

    /* Done */
    console.log('Application created');
};





/**
 * Controller
 */
Llama.Controller = function LlamaController(opt) {
    this.views = {};
    this.app = null; // parent app? render purposes?
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
Llama.View = function LlamaView(data, controller) {
    this.template = data;
    this.handlebars = Handlebars.compile(data);
    this.controller = controller;
}
Llama.View.prototype.render = function(data) {
    $('#' + this.controller.app.renderTo).html(
        this.handlebars(data)
    );
}





/**
 * Router
 */
Llama.Router = function LlamaRouter(path, rules) {
    this.path = path;
    this.rules = rules;
}
Llama.Router.prototype.match = function(str) {
    /* Invalid paths filtered */
    if (!str.length) {
        return false;
    }

    /* Process path and match with rules */
    str = str.split('/');
    var path = this.path.split('/');
    var obj = {};

    for (i in Object.keys(this.rules)) {
        obj[Object.keys(this.rules)[i]] = this.rules[Object.keys(this.rules)[i]];
    }

    if (path.length == str.length) {
        for (i in path) {
            if (path[i][0] != ':') {
                if (path[i] != str[i]) {
                    return false;
                }
            } else if (str[i] != ''){
                obj[path[i].substr(1)] = str[i];
            } else {
                return false;
            }
        }

        return obj;
    } else {
        return false;
    }
}





/* End */
console.debug('Llama is ready');