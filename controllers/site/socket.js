var fs = require('fs');
module.exports = (io,socket,ctrName) => {
    return {
        connect:()=>{
            console.log('download connect');
        },
        download: function(data) {
            if (socket) {
                console.log('downloading can be broadcast ')
            }

            if (!data) {
                console.log('no data ')
            }
            return {
                text: 'downloading..',
                currentPoint: 0,
                index: 0
            }
        },
        docs:(recived)=>{
            console.log(recived)
            return recived
        }
    }
}