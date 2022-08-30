exports.before = function(req, res, next) {
    next()
};

exports.index = function(req, res, next) {

    console.log('--- req.session ', req.session)

    //res.render('list', { users: db.users });
    res.locals.title = 'site'
    res.locals.partials = '';
    res.locals.partialRight = '';
    res.locals.isHome = true;
    res.render('index')
};

exports.edit = function(req, res, next) {
    res.render('edit', {
        user: req.user
    });
};

exports.show = function(req, res, next) {
    res.render('show', {
        user: req.user
    });
};
exports.signIn = function(req, res, next) {
    res.render('sign-in', {
        user: req.user
    });
};
exports.login = function(req, res, next) {
    res.render('login', {
        user: req.user
    });
};

exports.downloadDdocs = function(req, res, next) {
    console.log('-->%s %s %s', req.method, req.url, req.path)
    res.locals.title = 'site'
    //res.locals.isHome = true;
    res.render('downloadDdocs')
};

exports.update = function(req, res, next) {

    var body = req.body;
    req.site = body.site;

};

exports.messager = function(req, res, next) {
    res.locals.title = 'messager'
    res.render('messager')
};
exports.websocket = function(req, res, next) {
    res.locals.title = 'websocket'
    //res.locals.isDoc = true
    res.locals.partialRight = __dirname + '/views/partials/websocket-slider-right'
    //res.locals.layout = 'layout.doc.ejs'
    res.render('websocket')
};