/**
 * Llama
 */
var Llama = {
    include: function(src, callback) {
        console.debug('Llama: Including ' + src);

        /* Create the script object */
        var script = document.createElement('script');

        if (src.match(/\.js$/i)) {
            script.src = src;
            script.onload = function(ev) {
                if (typeof callback === 'function') {
                    callback();
                }
            };

            /* Put it on the DOM */
            document.getElementsByTagName('head')[0].appendChild(script);
        } else {
            script.id = src.replace(/\//g, '-').replace(/.tpl/, '');

            $.ajax(src, {
                complete: function(data, msg) {
                    if (msg == 'success') {
                        script.type = 'text/plain';
                        script.innerHTML = data.responseText;

                        /* Put it on the DOM */
                        document.getElementsByTagName('head')[0].appendChild(script);

                        if (typeof callback === 'function') {
                            callback();
                        }
                    }
                }
            });
        }
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
    this.renderTo = '#app';
    this.routes = {':controller/:action': {}, ':controller/:action/:data': {}};
    $.extend(this, options);

    var _this = this;

    /* Attach routers */
    this._routes = this.routes;
    this.routes = [];

    if (typeof this._routes === 'object') {
        var keys = Object.keys(this._routes);

        for (i in keys) {
            var key = keys[i];
            var router = new Llama.Router(this, key, this._routes[key]);
            this.routes.push(router);
        }
    }

    delete this._routes;

    /* Instancing the app controllers */
    if (typeof this.controllers == 'string') {
        this.controllers = [this.controllers];
    }

    this._controllers = this.controllers;
    this.controllers = {};
    var controllerPath = this.path + 'controllers/';

    if (typeof this._controllers === 'object') {
        var _i = 0;

        for (i in this._controllers) {
            Llama.include(controllerPath + this._controllers[i] + '.js', function() {
                _i++;

                if (_i == _this._controllers.length) {
                    // Finished loaded the controllers
                    delete _this._controllers;
                }
            });
        }
    }

    /* Done */
    console.info('Llama: Application created');
};

Llama.Application.prototype._ready = function(name, obj) {
    console.info('Llama: Application ready');

    var _this = this;

    /* Attach url change event */
    window.onpopstate = function(ev) {
        _this.processUrl();
    };

    /* Fire custom app ready event */
    if (typeof this.ready === 'function') {
        this.ready();
    }

    /* App ready, check if URL has a route */
    this.processUrl();
};

Llama.Application.prototype.createController = function(name, obj) {
    obj.app = this;
    obj.name = name;
    var controller = new Llama.Controller(obj);
    this.controllers[name] = controller;
};

Llama.Application.prototype.isReady = function() {
    var keys = Object.keys(this.controllers), i;

    for (i = 0; i < keys.length; ++i) {
        if (!this.controllers[keys[i]].isReady) {
            return false;
        }
    }

    return true;
};

Llama.Application.prototype.processUrl = function() {
    if (window.location.hash != '') {
        var _this = this;
        var success = false;
        var url = window.location.hash.substr(1);

        for (i in _this.routes) {
            if (success = _this.routes[i].match(url)) {
                break;
            }
        }

        if (!success) {
            console.warn('Llama: URL has no matched route');
        }
    }
}



/**
 * Controller
 */
Llama.Controller = function LlamaController(opt) {
    /* Create object */
    this.isReady = false;
    this.views = {};
    this.app = null; // parent app? render purposes?

    $.extend(this, opt);

    /* Creating preloaded views */
    if (typeof this.views == 'string') {
        this.views = [this.views];
    }

    var _this = this;
    var viewPath = this.app.path + 'views/';
    this._views = this.views;
    this.views = {};

    if (typeof this._views === 'object') {
        var _i = 0;
        var tplPref = this.app.path.replace('/', '') + '-views-';

        if (this._views.length > 0) {
            for (i in this._views) {
                Llama.include(viewPath + this._views[i] + '.tpl', function() {
                    var tplName = tplPref + _this._views[_i];
                    _this.views[_this._views[_i]] = Handlebars.compile($('#' + tplName).html());
                    _i++;

                    if (_i == _this._views.length) {
                        // Finished loaded the controllers, fire up the ready event of controller
                        delete _this._views;
                        _this.isReady = true;
                        _this._ready();
                    }
                });
            }
        } else {
            delete _this._views;
            _this.isReady = true;
            _this._ready();
        }
    }    
}

Llama.Controller.prototype.render = function(tpl, data) {
    if (typeof data === 'undefined') {
        data = {};
    }

    var tpl = this.views[tpl];
    $(this.app.renderTo).html(tpl(data));
};

Llama.Controller.prototype._ready = function(data) {
    console.info('Llama: Controller ' + this.name + ' ready');

    /* Run the ready function(if exists) */
    if (typeof this.ready === 'function') {
        this.ready(data);
    }

    /* Check application for readyness and fire ready event of the app */
    if (this.app.isReady()) {
        this.app._ready();
    }
};



/**
 * Router
 */
Llama.Router = function LlamaRouter(app, path, rules) {
    this.app = app;
    this.path = path;
    this.rules = rules;
};

Llama.Router.prototype.match = function(str) {
    /* Invalid paths filtered */
    if (!str.length) {
        return false;
    }

    /* Process path and match with rules */
    str = str.split('/');
    var path = this.path.split('/');
    var request = {};
    var keys = Object.keys(this.rules);

    for (i in keys) {
        request[keys[i]] = this.rules[keys[i]];
    }

    if (path.length == str.length) {
        for (i in path) {
            if (path[i][0] != ':') {
                if (path[i] != str[i]) {
                    return false;
                }
            } else if (str[i] != ''){
                request[path[i].substr(1)] = str[i];
            } else {
                return false;
            }
        }

        /* Process request */
        if (typeof this.app.controllers[request.controller] === 'undefined') {
            console.warn('LLama: Invalid controller in route', request.controller);
            return false;
        }

        if (typeof this.app.controllers[request.controller][request.action] === 'function') {
            console.log('Llama: Executing', request);
            this.app.controllers[request.controller][request.action](request);
        } else {
            console.warn('LLama: Invalid action in route', request.action);
            return false;            
        }

        return true;
    } else {
        return false;
    }
};



/* End */
console.info('Llama: Library loaded');