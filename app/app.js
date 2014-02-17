/* Create app */
var app = new Llama.Application({
    name: 'testApp',
    controllers: ['Page', 'Foo'],
    routes: {
        ':controller/:action': {},
        ':controller/:action/:data': {},
        'test': {
            controller: 'Foo',
            action: 'bar',
            boolean: true,
            foo: 'baz'
        }
    },

    ready: function() {
        app.controllers.Page.index();
    }
});