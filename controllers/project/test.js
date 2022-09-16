const console = require("console");
const fs = require("fs");
const bcrypt = require('bcrypt');

//console.log(Math.random());
// (async ()=>{

// const salt = await bcrypt.genSalt(10)
// const plainText = Math.random()+"test"
// const secret = await bcrypt.hash(plainText,salt)
// console.log(secret);
// })()
// CelValue = [[""],[""],[""]]
// console.log(JSON.stringify(CelValue))

var maintain = ()=>{
    console.log("maintain")
}
var interval = setInterval(maintain, 20^60*1000);
console.log("troi oi")  