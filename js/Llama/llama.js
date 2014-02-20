/**
 * Llama
 */
var Llama = {
    include: function(src, callback) {
        console.log('Including ' + src);

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
    $.extend(this, options);

    var _this = this;

    /* Attach routers */
    this._routes = this.routes;
    this.routes = [];

    if (typeof this._routes === 'object') {
        for (i in Object.keys(this._routes)) {
            var key = Object.keys(this._routes)[i];
            var router = new Llama.Router(key, this._routes[key]);
            this.routes.push(router);
        }
    }

    delete this._routes;

    window.onpopstate = function(ev) {
        if (window.location.hash != '') {
            var success = false;
            var request = false;
            var url = window.location.hash.substr(1);

            for (i in _this.routes) {
                if (request = _this.routes[i].match(url)) {
                    var action = _this.controllers[request.controller][request.action];

                    if (typeof action === 'function') {
                        console.debug('Executing', request);
                        _this.controllers[request.controller][request.action](request);
                        success = true;
                    }
                }
            }

            if (!success) {
                console.log('URL has no matched route');
            }
        }
    };

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
                    // Finished loaded the controllers, fire up the ready event 
                    delete _this._controllers;
                }
            });
        }
    }

    /* Done */
    console.log('Application created');
};
Llama.Application.prototype.createController = function(name, obj) {
    obj.app = this;
    obj.name = name;
    var controller = new Llama.Controller(obj);
    this.controllers[name] = controller;
}


/**
 * Controller
 */
Llama.Controller = function LlamaController(opt) {
    /* Create object */
    this.isReady = false;
    this.views = {};
    this.app = null; // parent app? render purposes?
    this.ready = function() {
        console.log(this, 'ready');
    }

    $.extend(this, opt);

    /* Creating preloaded views */
    if (typeof this.views == 'string') {
        this.views = [this.views];
    }

    var _this = this;
    var viewPath = this.app.path + 'views/';
    this._views = this.views;
    this.views = {};

    console.log(viewPath);

    if (typeof this._views === 'object') {
        var _i = 0;
        var tplPref = this.app.path.replace('/', '') + '-views-';

        for (i in this._views) {
            Llama.include(viewPath + this._views[i] + '.tpl', function() {
                var tplName = tplPref + _this._views[_i];
                _this.views[_this._views[_i]] = Handlebars.compile($('#' + tplName).html());
                _i++;

                if (_i == _this._views.length) {
                    // Finished loaded the controllers, fire up the ready event 
                    delete _this._views;
                    _this.isReady = true;
                    _this.ready();
                }
            });
        }
    }    
}
Llama.Controller.prototype.render = function(tpl, data) {
    if (typeof data === 'undefined') {
        data = {};
    }

    var tpl = this.views[tpl];
    $(this.app.renderTo).html(tpl(data));
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