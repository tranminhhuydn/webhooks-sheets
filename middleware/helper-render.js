
/*!
 * Express - Contrib - messages
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */
module.exports = function (req, res) {
  return function (template, locals) {
    //console.log(template)
    //locals.heplerSelect = {list:['troi','oi','dat'],name:'layout',compare:'dat'}
    var output =''
    if (template) {
      locals = locals || {};
      res.render(template, locals, function (err, html) {
        if (html) {
          output = html;
        }
      });
    } 

    return output;
  };
};
