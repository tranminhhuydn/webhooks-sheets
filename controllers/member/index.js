const fs = require("fs");
const {Member} = require('../../models/member');
const {Project} = require('../../models/project');
const {Sheets} = require('../../models/sheets');


exports.list = async function(req, res) {
    var id= req.params[0]
    

    var values = await Member.get()
    const result = values.filter((e, i) => {
        if (e[0] == id) return e
    })

    let data = result.map((e,i)=>{ return [e[0],e[1],e[2],e[3]]})
    // console.log(result)
    // res.render('members',{data:result,project:project})
    var {authemail,authsecret} = req.query
    if(!authemail||!authemail){
        res.status(403)  
        return res.send(JSON.stringify({error:"no value"}))
    }
    //check auth email and secret
    let ok = values.find((e)=>{return e[1]==authemail && e[4]==authsecret})
    if(!ok){
        res.status(403)  
        return res.send(JSON.stringify({error:"authemail or authsecret not truth"}))
    }
    res.send(JSON.stringify(data))
};
exports.userSheet = async function(req, res) {
    var id= req.params[0]
    var {email} = req.query
    var {authemail,authsecret} = req.query
    if(!authemail||!authemail){
        res.status(403)  
        return res.send(JSON.stringify({error:"no value"}))
    }
    //check auth email and secret
    var values = await Member.get()
    let ok = values.find((e)=>{return e[1]==authemail && e[4]==authsecret})
    if(!ok){
        res.status(403)  
        return res.send(JSON.stringify({error:"authemail or authsecret not truth"}))
    }
    //read project 
    var data = await Project.get()
    data = data.find((e,i)=>{return e[0]==id})
    const spreadsheetId = data[5]

    var values = await Sheets.valuesGet(spreadsheetId,email)

    res.send(JSON.stringify(values))
};
exports.members = async function(req, res) {
    var id= req.params[0]
    res.locals.isSliderCenter=true
    let token = req.cookies['session-token'];
    
    //read project 
    var values = await Project.get()
    var project =  values.find((e,i)=>{return e[0]==id})
    //console.log(project)

    var values = await Member.get()

    const result = values.filter((e, i) => {
        if (e[0] == id) return e
    })
    console.log(result)
    res.render('members',{data:result,project:project,user:token})
};
// exports.sheet = async function (req, res, next) {
//     var id = req.params[0]
//     try {
//         var {name} = req.query

//         var data = await Project.get()
//         data = data.find((e,i)=>{return e[0]==id})
//         const spreadsheetId = data[5]
    
//         //return res.send(JSON.stringify({message:"sheet "+name+" readly create"}))
   
//         const response = await Sheets.get(spreadsheetId,name)
//         //console.log(response)
//         // GET rowCount
//         // console.log(response.sheets[0].properties)
//         // console.log(response.sheets[0].properties.gridProperties.rowCount)
//         //
//         if(response){
//             //const {sheetId} = response.sheets[0].properties
//             var resource = {
//                 "requests": [
//                     {
//                         "insertDimension": 
//                         {
//                             "range": {
//                                 "sheetId": response.sheets[0].properties.sheetId,
//                                 "dimension": "ROWS",
//                                 "startIndex": 1000,
//                                 "endIndex": 2000
//                             }
//                             ,"inheritFromBefore": false
//                         }
//                     }
//                 ]
//             }
//             await Sheets.batchUpdate(spreadsheetId,resource)
//             return res.send(JSON.stringify({message:"sheet "+name+" autoResizeDimensions"}))
//         }

//         //add new sheet
//         if(!response){
//             await Sheets.add(spreadsheetId,name)
//             return res.send(JSON.stringify({message:"sheet "+name+" create"}))
//         }
//     }catch(e){

//     }
//     res.header("content-type",'application/json; charset=UTF-8')     
//     res.status(403)    
//     res.send(JSON.stringify({error:"no value"}))
// }