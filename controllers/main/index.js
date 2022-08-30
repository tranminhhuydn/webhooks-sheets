var fs = require('fs');
var path = require('path');
var {
    ROLE
} = require('../../models/user');


exports.index = function(req, res) {
    
    var dir = path.join(__dirname, '../../', 'controllers');
    var verbose = true;
    var lists = []
    fs.readdirSync(dir).forEach(function(name) {
            var file = path.join(dir, name)
            if (!fs.statSync(file).isDirectory()) return;

            if (name == 'main') return;

            lists.push({
                    name: name
                })
                //verbose && console.log('\n   %s:', name);
                //var obj = require(file)(socket);
        })
        //console.log(req.url);
    var view = 'index'
    if (req.url == '/') {
        //req.app.set('views',__dirname+'/views')
        //res.locals.layout = '../../../views/layout'
        view = '../controllers/main/views/index'
    }
    res.render(view, {
        lists: lists,
        'isHome': true
    })
};
exports.slug = function(req, res) {

    res.locals.params = req.params

    console.log(res.locals.params)
    //res.locals.layout = 'layout'
    var view = '../controllers/main/views/slug'
    res.locals.layout = '../views/layout'
    res.render(view)

};