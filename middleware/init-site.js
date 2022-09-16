var
    fs = require('fs')
var {
    ROLE
} = require('../models/user');
exports.iniSite = function(req, res, next) {
  
    res.locals.config = JSON.parse(fs.readFileSync('./config/setting.json', 'utf8'));

    var {config} = res.locals
    //console.log(res.locals.config.MAINMENU);
 
    res.locals.title = "home"
        //res.locals.csrf = req.csrfToken()

    //#helper 
    //#helper for form
    res.locals.form = {}
    res.locals.form.url = req.url

    //#appURL
    var port = req.app.get('PORT')
    , subdomains = req.subdomains.join('.')
    ,url = req.protocol+"://"
    url = subdomains?url+subdomains+'.':url
    url += req.hostname+':'+port
    req.appURL = url

    //:todo i18n
    //auto add if key not in original lang
    res.locals.t = req.t = function(str) {
        if(config.deploy==false){
            var en = fs.readFileSync("./locales/en/translation.json")
            en = JSON.parse(en)
            if(!en[str]){
                en[str] = str
                fs.writeFileSync("./locales/en/translation.json",JSON.stringify(en,null,"\t"))
            }
        }
        return str;
    }
    if (req.cookies['session-token'] != null)
        req.session.user = req.cookies['session-token']
    //:todo immulate login 
    if (req.session.user != null) {
        req.user = req.session.user
        res.user = req.session.user
    }
    req.isAuthenticated = function() {
        if (req.session.user == null)
            return false;
        return true;
    }

    req.ROLE = ROLE

    //SET LAYOUT DEFAULT
    res.locals.layout = 'layout.doc.ejs'
    if (req.url != '/')
        res.locals.layout = '../../../views/layout.doc.ejs'

    //OVER WRITE RENDER
    res.render = function render(view, options, callback) {
        var app = this.req.app;
        var done = callback;
        var opts = options || {};
        var req = this.req;
        var self = this;

        // support callback function as second arg
        if (typeof options === 'function') {
            done = options;
            opts = {};
        }

        // merge res.locals
        opts._locals = self.locals;

        // default callback to respond
        done = done || function(err, str) {
            if (err) return req.next(err);
            //console.log('--------------str');
            self.send(str);
        };
        //console.log('-----------layout',res.locals.layout )
        res.locals.view = app.get('views') + '/' + view
        var layout = res.locals.layout=='../views/layout'? 'layout.doc.ejs': res.locals.layout
            // console.log('-----------layout',layout )
            // console.log('view',res.locals.view )
            // render
        app.render(layout, opts, done);
    }
};