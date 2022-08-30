/**
 * Module dependencies.
 */

//var express = require('../../lib/express');
var express = require('express');
var fs = require('fs');
var path = require('path');
function globalValue (req, res,next) {
    res.locals.controller = res.controller = req.controller = req.app.get('controller')
    next()
}

module.exports = function(parent, options) {
    var dir = path.join(__dirname, '..', 'controllers');
    var verbose = options.verbose;
    var routeController = (obj,app,urlRoute,handler,fnStr) => {
        // before middleware support
        var methods = ['checkout','copy','delete','get','head','lock','merge','mkactivity','mkcol','move','m-search','notify','options','patch','post','purge','put','report','search','subscribe','trace','unlock','unsubscribe'];

        if (obj.before) {
            methods.forEach(m=>{
                if(obj.middleware && obj.middleware[fnStr]){
                    app[m](urlRoute, globalValue, obj.middleware[fnStr], obj.before, handler);
                }else{
                    app[m](urlRoute, globalValue, obj.before, handler)
                }
            })
            console.log('     %s -> before -> %s', urlRoute, fnStr);
        } else {
            methods.forEach(m=>{
                app[m](urlRoute, globalValue, handler);
            })
            methods.forEach(m=>{
                if(obj.middleware && obj.middleware[fnStr]){
                    app[m](urlRoute, globalValue, obj.middleware[fnStr], handler);
                }else{
                    app[m](urlRoute, globalValue, handler)
                }
            })
            console.log('     %s -> %s', urlRoute, fnStr);
        }
    }
    fs.readdirSync(dir).forEach(function(name) {
        var file = path.join(dir, name)
        if (!fs.statSync(file).isDirectory()) return;
        //console.log(verbose)
        verbose && console.log('\n   %s:', name);
        var 
            obj = require(file),
            name = obj.name || name,
            app = express(),
            handler,
            urlRoute,
            config = JSON.parse(fs.readFileSync('./config/setting.json', 'utf8'))

        app.set('controller', name);
        app.set('views', path.join(__dirname, '..', 'controllers', name, 'views'));
        //console.log(path.join(__dirname, '..', 'controllers', name, 'public'))
        app.use(express.static(path.join(__dirname, '..', 'controllers', name, 'public'))) // Set Public Folder

        // generate routes based
        // on the exported methods
        var passSome = ['before','middleware','routeParam']
        for (var key in obj) {
            //not route before middleware routeParam
            if(passSome.indexOf(key)!=-1) continue;
            // setup
            handler = obj[key];

            // route with config 
            name = config.route[name]?config.route[name]:name

            urlRoute = '/' + name + '/' + key;
 
            routeController(obj,app,urlRoute,handler,key)
            var subUrlRoute = urlRoute+'/*'
            routeController(obj,app,subUrlRoute,handler,key)
            
            //route without index
            if (key == 'index') {
                urlRoute = '/' + name;
                routeController(obj,app,urlRoute,handler,key)
            }
        }
        // mount the app
        parent.use(app);
    });
};