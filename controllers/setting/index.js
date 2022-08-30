var fs = require('fs');
var path = require('path');


exports.before = function(req, res, next) {
    res.locals.title = 'Setting'
    next();
};
exports.index = function(req, res) {
    res.render('index', {
        lists: []
    })
};
exports.setting = function(req, res) {

    var path = './config/setting.json'
    var config = fs.readFileSync(path, 'utf8');
    config = JSON.parse(config)

    //POST
    if (req.method=='POST') {
        //console.log(req.body.result)
        // delete req.body.line
        // delete req.body._csrf
        //     // console.log(req.body)
        config = req.body.result
        //fs.writeFileSync(path, JSON.stringify(config, null, "\t"), 'utf8');
        fs.writeFileSync(path, config, 'utf8');

        req.flash('success', 'save setting success full');

        return res.redirect('/setting/setting')
    }
    //GET

    res.render('setting', {
        config: config
    })
};