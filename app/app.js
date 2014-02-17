/* Create app */
var app = new Llama.Application({
    name: 'testApp',
    controllers: ['Page', 'Foo'],
    routes: {
        ':controller/:action/:data': {
            foo: 'bar',
            page: '1'
        },
        'crap': {
            controller: 'Foo',
            action: 'bar',
            crappy: true,
            foo: 'baz'
        }
    },

    ready: function() {
        app.controllers.Page.index();
    }
});