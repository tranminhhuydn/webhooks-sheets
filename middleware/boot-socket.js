var fs = require('fs');
var path = require('path');

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

function autoLoadSocket(io,socket,next) {
    // console.log('   baseUrl %s',socket.request.baseUrl)
    // console.log('   originalUrl %s',socket.request.originalUrl)
    //console.log('   request %s',socket.request)
    //console.log('   request.headers %s',socket.request.headers)
    //console.log('   request.headers.referer %s',socket.request.headers.referer)
    //var url = url.parse(socket.request.headers.referer);
    //var val = parseUrl(socket.request.headers.referer).pathname;
    //url.parse(url, parseQueryString, slashesDenoteHost);
    var url = require('url');
    //console.log('   url %s',url.parse(socket.request.headers.referer).path)
    url = url.parse(socket.request.headers.referer).path
    //console.log('   url %s',url)
    var parse = /\/(\w+)\/(\w+)/g.exec(url)
    var controller = parse[1]
    //console.log('   parse %s',parse)
    socket.onEmit = (eventName, callback) => {
        socket.on(eventName, (data) => {
            var r = callback(data)
                //answer
            if (r != undefined && r.broadcast) {
                delete r.broadcast
                socket.broadcast.emit(eventName, r)
                return next();
                
            }
            if (r != undefined) {
                socket.emit(eventName, r)
            }
        })

        //return socket;
    }
    //var dir = path.join(__dirname, '..', 'sockets');
    var dir = path.join(__dirname, '..', 'controllers');
    if(!controller)
        next()
    console.log('   Boot socket');
    var eventDefaults=['connect','disconnect','disconnecting']
    fs
        .readdirSync(dir)
        .forEach(function(name) {
            if(name!==controller) return;
            var file = path.join(dir, name, 'socket.js')
            //console.log('   %s',file);
            //if (!fs.statSync(file).isDirectory()) return;
            if (!fs.existsSync(file)) return;
            // //if (name!='socket') return;
            // //console.log('socket');
            // console.log('   %s',file);
            // console.log('   name: %s',name);
            // console.log('   name: %s',path.join(dir,name, 'socket.js'));
            name = '/' + name + '/'
            var obj = require(file)(io,socket,name)
            //var name = '/test/'
            for(var key in obj){
                if(eventDefaults.indexOf(key)!=-1){
                    socket.onEmit(key,obj[key])
                    continue;
                }
                var route = name+key
                //socket.on(route,obj[key])
                socket.onEmit(route, obj[key])
                console.log('     %s',route)
            }

        })
    
}

module.exports = function(server, app, options) {
    var io = require('socket.io')(server)
    //console.log('app.request %s',app.request)
    //middleware
    io.use(app.wrapSession);

    //#in a middleware
    io.use(async(socket, next) => {
        try {
            autoLoadSocket(io,socket,next)
        } catch (e) {
            next(new Error("unknown user"));
        }
        next();
    });

    // io.sockets.on('connection', (socket) => {
    //     //console.log(socket.rooms)
    //     //console.log('room1 ', io.in("room1"))
    // });

    io.on("connection", (socket) => {
        // socket.on("disconnecting", (reason) => {
        //     for (const room of socket.rooms) {
        //         if (room !== socket.id) {
        //             socket.to(room).emit("user has left", socket.id);
        //         }
        //     }
        // });
    });
};

/*
#Room events
    create-room (argument: room)
    delete-room (argument: room)
    join-room (argument: room, id)
    leave-room (argument: room, id)

    io.of("/").adapter.on("create-room", (room) => {
        console.log(`room ${room} was created`);
    });

    io.of("/").adapter.on("join-room", (room, id) => {
        console.log(`socket ${id} has joined room ${room}`);
    });

disconnect
disconnecting

#Socket middlewares
io.on("connection", (socket) => {
  socket.use(([event, ...args], next) => {
    if (isUnauthorized(event)) {
      return next(new Error("unauthorized event"));
    }
    next();
  });

  socket.on("error", (err) => {
    if (err && err.message === "unauthorized event") {
      socket.disconnect();
    }
  });
});



socket.on("disconnecting", () => {
    console.log(socket.rooms); // the Set contains at least the socket ID
});

*/