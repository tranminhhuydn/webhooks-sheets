var fs = require('fs');
var path = require('path');
const {User} = require('../../models/user');

exports.before = async function(req, res, next) {
    res.locals.title = 'User'
    next();
};

exports.profile = function(req, res) {
    let token = req.cookies['session-token'];
    res.render('profile',{user:token})
};
exports.list = async (req, res) => {
    const values = await User.get()
    res.render('list-google',{data:values})
}
exports.login = async function (req, res) {
    //POST 
    if (req.method == 'POST') {
        let token = req.body.token;
        var provider = JSON.stringify(token)
        //read
        const values = await User.get()

        //find
        //const {values} = getRows.data
        const result = values.find((e,i)=>{
            if(e[0]==token.email) return e
        })
        //write
        if(!result){
            token.role = values.length==1? 'admin':'user'
            await User.add({
                values: [[token.email,token.name,token.role,  provider]],
            })
            req.flash('success', req.t('recode had save'))
        }

        if(result)
            token.role = result[2]
        req.session.user = token
        res.cookie('email', token.email);
        res.cookie('name', token.name);
        res.cookie('session-token', token);
        return res.send('success')
    }
    //GET
    if (req.method == 'GET') {
        if(req.cookies['session-token'] != null)
            req.session.user = req.cookies['session-token']
        if (req.session.user != null || req.cookies['session-token'] != null) {
            req.flash('danger', req.t('You are ready login'))
            return res.redirect('/user')
        }
        res.locals.title = req.t('User-login')
        return res.render('login2')
    }
};

exports.logout = function(req, res) {
    res.clearCookie('session-token');
    res.clearCookie('email');
    res.clearCookie('name');
    req.session.user = null
    return res.redirect('/')
};
