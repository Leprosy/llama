/**
 * RD Sinlgeton
 */
var RD = {
    createApp: function(opt) {
        console.group('Creating App');

        /* Creating app attributes and app instance */
        console.log('Creating attributes');
        var options = {
            path: 'app/',
            name: 'MyApp',
            controllers: 'Index',
            renderTo: 'app'
        };

        $.extend(options, opt);
        var app = new RD.Application(options);
        console.log('App created', options);

        /* Instancing the app controllers */
        console.log('Creating app controllers');
        var controllerPath = app.path + 'controllers/';

        if (typeof app.controllers == 'object') {
            for (i in app.controllers) {
                app.getController(app.controllers[i]);
            }
        }

        /* Done */
        console.groupEnd();
        return app;
    },

    include: function(src, callback) {
        console.group('Including file ' + src);
        var scrpt = document.createElement('script');

        if (typeof callback == 'function') {            
            scrpt.src = src;
            scrpt.onload = function(ev) {
                console.log(src + ' included and ready');
                callback();
            };

            document.body.appendChild(scrpt);
        } else {
            $.ajax(src, {
                async: false,
                complete: function(data, msg) {
                    if (msg == 'success') {
                        scrpt.innerHTML = data.responseText;
                        document.body.appendChild(scrpt);
                    }
                } 
            });
        }

        console.groupEnd();
    }
}



/**
 * Application
 */
RD.Application = function(opt) {
    $.extend(this, opt);

    /* Controller list */
    if (typeof this.controllers == 'string') {
        var tmp = this.controllers;
        this.controllers = {};
        this.controllers[tmp] = undefined;
    }

    /* Fire when ready */
    var _this = this;
    $(window).load(function() {
        console.log('Application ready');
        _this.ready();
    });
};
RD.Application.prototype.getController = function(name, callback) {
    if (typeof this.controllers[name] != 'object') {
        var _this = this;
        var controllerPath = _this.path + 'controllers/';

        RD.include(controllerPath + name + '.js', function() {
            /* Namespacing and misc. attributes */
            _this.controllers[name] = window[name];
            _this.controllers[name].name = name;
            _this.controllers[name].app = _this;
            delete window[name];

            if (typeof callback == 'function') {
                callback(_this.controllers[name]);
            }
        });
    }

    return this.controllers[name];
}


/**
 * Controller
 */
RD.Controller = function(opt) {
    this.views = {};
    $.extend(this, opt);
}
RD.Controller.prototype.getView = function(src, callback) {
    if (typeof this.views[src] == 'undefined') {
        var _this = this;
        var _name = src;
        src = this.app.path + "views/" + this.name + "/" + src + ".tpl"
        console.group('Including view in ' + src);
        console.log('Including view ' + src);
    
        $.ajax(src, {
            complete: function(data, msg) {
                if (msg == 'success') {
                    var view = new RD.View(data.responseText, _this)
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
}


/**
 * View
 */
RD.View = function(data, controller) {
    this.template = data;
    this.handlebars = Handlebars.compile(data);
    this.controller = controller;
}
RD.View.prototype.render = function(data) {
    $('#' + this.controller.app.renderTo).html(
        this.handlebars(data)
    );
}