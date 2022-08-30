const mongoose = require('mongoose');
var tree = require('../middleware/model-tree');
// Article Schema
const objSchema = mongoose.Schema({
  category_id: {
    type: String,
  },
  author: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  createAt:{
    type:Date,
    immutable:true,
    default:()=> Date.now()
  },
  updateAt:{
    type:Date,
    default:()=> Date.now()
  },
  status:{
    type:Boolean,
    default:false
  }
});

const slugGenerator = (schema,options) =>{
  
  var _default = {
    slug: {
      type: String,
      lowercase: true,
      trim: true
    }
  }
  var generator = function(v) {
    var 
    f = 'áàãảạăắằẵẳặâấầẫẩậđóòõỏọôốồỗổộơớờỡởợéèẽẻẹêếềễểệúùũủụưứừữửựíìĩỉịýỳỹỷỵ',
    r = 'aaaaaaaaaaaaaaaaadoooooooooooooooooeeeeeeeeeeeuuuuuuuuuuuiiiiiyyyyy',
    slug = v.toLowerCase()
    for (var i = 0; i < f.length; i++) {
      slug = slug.replace(new RegExp(f[i],'g'),r[i]) 
    }
    return slug.replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  }

  schema.pre('save',async function(next, done) { this.slug = generator(this.title);next();});

} 

objSchema.plugin(slugGenerator);

const Dictionary = mongoose.model('Dictionary', objSchema);

module.exports.Dictionary = Dictionary;
