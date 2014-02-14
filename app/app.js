/* Create app */
var app = new Llama.Application({
    name: 'testApp',
    controllers: ['Page'], //, 'Foo'],

    ready: function() {
        app.controllers.Page.index();
    }
});