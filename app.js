const
    fs = require('fs'),
    express = require('express'),
    path = require('path'),
    expressValidator = require('express-validator'),
    flash = require('connect-flash'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    passport = require('passport'),
    config = require('dotenv').config(),
    //const connectDB = require('./config/database'),

    i18next = require('i18next'),
    Backend = require('i18next-fs-backend'),
    i18nextMiddleware = require('i18next-http-middleware'),
    ejs = require('ejs'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    app = express();
    
    //database connection
    //connectDB();
    //console.log(config);

// settup setting.json
if(!fs.existsSync("config/setting.json")){
    var data = fs.readFileSync("config/setting.default.json")
    fs.writeFileSync("config/setting.json",data)
}
console.log('---------------------------process.env.CREDENTIALS')
console.log(process.env.CREDENTIALS)

if(!fs.existsSync('./dist'))
    fs.mkdirSync('./dist')

if(!fs.existsSync('./dist/credentials.json')){
    fs.writeFileSync('./dist/credentials.json',process.env.CREDENTIALS,"utf8")
}

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
const initSession = session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
})
app.wrapSession = wrap(initSession)

i18next
    .use(Backend)
    .use(i18nextMiddleware.LanguageDetector)
    .init({
        fallbackLng: 'en',
        backend: {
            loadPath: './locales/{{lng}}/translation.json',
            addPath: './locales/{{lng}}/{{ns}}.missing.json'
        }
    })


// const handle = i18nextMiddleware.handle(i18next)
// app.use(handle);
app.use(i18nextMiddleware.handle(i18next));

// Bring in Models
if (!module.parent)
    app.use(morgan('dev'));

//Middleware
app
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs') // Load View Engine
app
    // .use(express.json())
    .use(cookieParser()) // Set Public Folder
    .use(express.static(path.join(__dirname, 'public'))) // Set Public Folder
    .use(express.urlencoded({
        limit:'5000kb',
        extended: true
    })) // parse application / x - www - form - urlencoded
    .use(express.json()) // parse application/json
    .use(initSession) // Express Session Middleware
    .use(require('connect-flash')()) // Express Messages Middleware


var {
    accessRole
} = require('./middleware/basic-auth');


//INIT SITE
var {
    connectionDB,
    iniSite
} = require('./middleware/init-site');

    app.use(connectionDB)

//HELPER
app.use(async function(req, res, next) {
    res.locals.messages = req.flash();    
    iniSite(req, res, next)
    return accessRole(req, res, next)
});


// Express Validator Middleware
// app.use(expressValidator({
//   errorFormatter: function (param, msg, value) {
//     var namespace = param.split('.')
//       , root = namespace.shift()
//       , formParam = root;

//     while (namespace.length) {
//       formParam += '[' + namespace.shift() + ']';
//     }
//     return {
//       param: formParam,
//       msg: msg,
//       value: value
//     };
//   }
// }));

// Passport Config
//require('./middleware/passport')(passport);

// Passport Middleware
// app.use(passport.initialize());
// app.use(passport.session());

app.get('*', function(req, res, next) {
    res.locals.user = req.user || null;
    next();
});




// parse application/json
// app.use(bodyParser.json({
//     limit: process.env.BODY_SIZE || '50mb'
// }));


//LOAD CONTROOLER
require('./middleware/boot-controller')(app, {
    verbose: !module.parent
});

//HOME SITE
var {
    index,
    slug
} = require('./controllers/main');
app.get('/', index);
app.get('/:parent', slug);
app.get('/:parent/:farther', slug);
app.get('/:parent/:farther/:child', slug);




// Start Server
//var port = 4201

var port = process.env.PORT || 3000
app.set('PORT',port)
    server = app.listen(port, function() {
        socket = require('./middleware/boot-socket')
            // load sockets
        var ioApp = socket(server, app, {
            verbose: !module.parent
        })
        console.log('Server started on port %s...', port);
    });