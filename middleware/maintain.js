exports.maintain = function() {
    var https = require('https');
    var http = require('http');
    var client,address
    address = process.env.URL_MAINTAIN
    client = address.indexOf('https')==0?https:http

    var callMainTain = ()=>{
        var req = client.get(address,(res)=>{
            var body = ""
            res.on('data', (data) => {
                body += data.toString("utf8")
            })
            res.on('end', () => {
                //console.log(body)
            })
        })
        //console.log(address)
    }
    if(address){
        var timeInterval = 20*60*1000
        //timeInterval = 5*1000
        var interval = setInterval(callMainTain, timeInterval);
    };
}