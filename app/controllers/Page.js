app.controllers.Page = new Llama.Controller({
    index: function() {
        this.getView('index', function(view) {
            view.render({
                title: "Welcome to the Page Controller",
                content: "Content of the index view of the Page Controller."
            });
        });
    }
});
