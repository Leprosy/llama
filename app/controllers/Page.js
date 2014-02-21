app.createController('Page', {
    ready: function() {
        console.log('Page controller is ready');
    },
    views: ['pageindex'],

    index: function(data) {
        this.render('pageindex', {
            title: 'Page controller, executing "index" action',
            route: 'Page/index',
            to: '#Foo/index',
            content: 'This is the content rendered by the Page controller, doing the action "index".'
        })
    }
});
