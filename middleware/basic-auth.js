exports.accessRole = function(req, res, next) {

  var
      url = /\/(\w+)\/(\w+)/g.exec(req.url),
      {
          accessRole
      } = res.locals.config

  var controller = url && url[1] ? url[1] : null,
      action = url && url[2] ? url[2] : null,
      access = controller && action  && accessRole[controller] &&  accessRole[controller][action] ? accessRole[controller][action] : null

  // console.log('--> url', url);
  // console.log('--> controller', controller);
  // console.log('--> action', action);
  // console.log('--> access', access);
  if (access) {
      res.locals.accessRole = access ? access : []
      return authUser(req, res, () => {
          return authRole(req, res, next)
          //return next()
      })
  }
  return next();
};

function authRole(req, res, next) {
    var role = res.locals.accessRole
    if (Array.isArray(role) && role.indexOf(req.user.role) == -1) {
        req.flash('danger', req.t('not alowed'));
        return res.redirect('/');
    } else if (!Array.isArray(role) && req.user.role !== role) {
        req.flash('danger', req.t('not alowed'));
        return res.redirect('/');
    }
    next()
}

// Access Control
function authUser(req, res, next) {
    if (req.user && req.ROLE.ADMIN == req.user.role)
        return next()

    if (req.isAuthenticated()) {
        return next()
    } else {
        req.flash('danger', req.t('please login'));
        return res.redirect('/' + res.locals.config.route['user'] + '/login');
    }
}

function isOwner(compare, req) {
    //console.log(compare+' '+req.user._id+'');
    return (
        req.user && (req.ROLE.ADMIN === req.user.role ||
            req.ROLE.MANAGER === req.user.role ||
            compare + '' === req.user._id + '')
    )
}

exports.authUser = authUser
exports.authRole = authRole
exports.isOwner = isOwner