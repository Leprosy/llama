app.createController('Page', {
    views: ['pageindex'],

    index: function(data) {
        console.log('Page/index => ', data);
    }
});
