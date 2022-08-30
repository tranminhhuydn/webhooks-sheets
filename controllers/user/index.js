var fs = require('fs');
var path = require('path');

const { graphql } = require("graphql");
const {graphqlHTTP,expressGraphQL} = require('express-graphql')
var {schema,initDB} = require('./../../data/index.js')


// exports.add = async (req, res) => {
//   if (req.method == 'POST') {
//     var query = `mutation{addBook(name:"${req.body.bookName}",authorId:1) {id}}`
//      graphql(schema, query).then((result) => {
//       if(result.errors)
//         req.flash('danger',result.errors.join('<br>'))
//       else
//       req.flash('success', req.t('recode had save'))
//       return res.redirect(`/${res.controller}/list`)
//     });
//   }
//   if(req.method=='GET')
//     res.render("add")
// }


exports.before = function(req, res, next) {
    res.locals.title = 'User'
    next();
};

exports.profile = function(req, res) {
    let token = req.cookies['session-token'];
    res.render('index',{user:token})
};
exports.list = async (req, res) => {
  //console.log(req.baseUrl)
  var query = "{users{name,email,role}}"
  graphql(schema, query).then((result) => {
    res.render('list',{data:result.data.users})
  });
}
exports.login = function(req, res) {
    //POST
    if (req.method=='POST') {
        let token = req.body.token;
        var provider = JSON.stringify(token)
        provider = provider.replace(/\"/g,"\\\"")
        console.log(provider)
        var query = `mutation{addUser(name:"${token.name}",email:"${token.email}",provider:"${provider}") {role}}`
        graphql(schema, query).then((result) => {
            if (result.errors){
                req.flash('danger', result.errors.join('<br>'))
                return res.send(result.errors.join('\n<br>'))
            }else
                req.flash('success', req.t('recode had save'))
           
            token.role = result.data.addUser.role
            req.session.user = token
            res.cookie('session-token', token);
            return res.send('success')

            //return res.redirect(`/${res.controller}/profile`)
        });
    }
    //GET
    if (req.method=='GET') {
        if (req.session.user != null || req.cookies['session-token']!=null) {
            req.flash('danger', req.t('You are ready login'))
            return res.redirect('/user')
        }
        res.locals.title = req.t('User-login')
        return res.render('login2')
    }
};

exports.logout = function(req, res) {
    res.clearCookie('session-token');
    req.session.user = null
    return res.redirect('/')
};

exports.test = function(req, res) {
    res.locals.title = req.t('User-test access ')
    return res.render('login2')
};
exports.admin = function(req, res) {
    res.locals.title = req.t('User-test access admin')
    return res.render('login2')
};


