app.controllers.Foo = new Llama.Controller({
    index: function(data) {
        console.log(data);
    },

    bar: function(data) {
        console.log('Foo/bar => ', data);
    }
});