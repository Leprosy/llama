app.createController('Foo', {
    views: ['pageindex'],

    ready: function() {
        console.log('Foo controller is ready');
    },

    index: function(data) {
        this.render('pageindex', {
            title: 'Foo controller, executing "index" action',
            route: 'Foo/index',
            to: '#Page/index',
            content: 'This is the content rendered by the Foo controller, doing the action "index".'
        });
    },

    bar: function(data) {
        this.render('pageindex', {
            title: 'Foo bar',
            route: 'Foo/bar',
            to: '#Page/index',
            content: 'This is the content rendered by the Foo controller, doing the action "bar".'
        });
    }
});
