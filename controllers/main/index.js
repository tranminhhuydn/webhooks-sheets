var fs = require('fs');
var path = require('path');
var {
    ROLE
} = require('../../models/user');


exports.index = function(req, res) {
    
    if(!fs.existsSync('./dist'))
        fs.mkdirSync('./dist')

    if(!fs.existsSync('./dist/credentials.json'))
        return res.redirect('/main/credentials')

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
exports.credentials = function(req, res) {

    res.locals.params = req.params

    res.locals.layout = '../../../views/layout'
    

    if(req.method=="POST"){
        const {data,sheetid} = req.body 
        fs.writeFileSync("./dist/credentials.json",data,"utf8")
        fs.writeFileSync("./dist/sheetid.txt",sheetid,"utf8")
        return res.redirect("/user/login")
    }
    if(req.method=="GET"){
        if(fs.existsSync("./dist/credentials.json")){
            req.flash('danger', req.t('The application has been set up'))
            return res.redirect("/")
        }
        res.render("credentials")
    }

};
exports.slug = function(req, res) {

    res.locals.params = req.params

    console.log(res.locals.params)
    res.locals.layout = 'layout'
    var view = '../controllers/main/views/slug'
    res.locals.layout = '../views/layout'
    res.render(view)

};
