const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var tree = require('../middleware/model-tree');
//var MpathPlugin = require('mongoose-mpath');
var {slugGenerator} = require('../middleware/mongooge-slug-generator');

var streamWorker = require('stream-worker');


// Tree Schema
const objSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true
  },
  link: {
    type: String,
  },
  icon: {
    type: String,
  },
  controller: {
    type: String,
  },
  layout: {
    type: String
  },
  view: {
    type: String
  },
  author: {
    type: String,
    required: true
  },
  status:{
    type:Boolean,
    default:false
  }
});

function inOrder (schema,options) {
  schema.add({
    inorder: {type: Number}
  });
  var 
  idType = options && options.idType || Schema.ObjectId

  async function preSave(next, done) {
    //this is doc
    //console.log('----- preSave',this.op)
    var self = this
    let model = this.model(this.constructor.modelName)
    const data = await model.find({parent: this.parent})

    self.collection.update({_id: this._id}, {$set: {inorder: data.length-1}}, done);
    next(); 
  }

  schema.pre('save', preSave)

  schema.methods.inOrder = async function inOrder(next){
    console.log('inorder ');
    let self= this
    let cursor = this.collection.find({parent: this.parent}).sort({inorder:1})
    var index = 0;
    // for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    //   self.collection.update({ _id: doc._id }, { $set: { inorder: index } },1);
    //   index++;
    //   console.log(index);
    // }
    let numWorkers = 1
    streamWorker(cursor.stream(), numWorkers, function streamOnData(doc, done) {
        self.collection.update({ _id: doc._id }, { $set: { inorder: index } },done);
        index++;
    },
    next);
    return this
  };
  schema.methods.moveUp = async function moveUp(level){
    //console.log('moveUp')
    level = level||1
    let self = this,
    cursor = this.collection.find({parent: this.parent,inorder:{$lt:this.inorder}}).sort({inorder:-1})

    while(level>=1){
      let doc = await cursor.next(),
      tmpInorder = this.inorder;
      let done = 1
      if(doc!=null){
        let tmpLastDocInorder = doc.inorder
        this.inorder = doc.inorder
        self.collection.update({ _id: this._id }, { $set: { inorder: tmpLastDocInorder } },done);
        self.collection.update({ _id: doc._id }, { $set: { inorder: tmpInorder } },done);
      }
      level--
    }
    return this;
  };
  schema.methods.moveDown = async function moveDown(level,next){
    //console.log('moveDown')
    level = level||1
    let self = this,
    cursor = this.collection.find({parent: this.parent,inorder:{$gt:this.inorder}}).sort({inorder:1})
    
    while(level>=1){
      let doc = await cursor.next(),
      tmpInorder = this.inorder;
      let done = 1
      if(doc!=null){
        let tmpLastDocInorder = doc.inorder
        this.inorder = doc.inorder
        self.collection.update({ _id: this._id }, { $set: { inorder: tmpLastDocInorder } },done);
        self.collection.update({ _id: doc._id }, { $set: { inorder: tmpInorder } },done);
      }
     level--
    }

    return this;
  };

}

objSchema.plugin(tree,{
  pathSeparator : '#',              // Default path separator
  onDelete :      'DELETE',       // Can be set to 'DELETE' or 'REPARENT'. Default: 'REPARENT'
  numWorkers:     5,                // Number of stream workers
  idType:         objSchema._id  // Type used for _id. Can be, for example, String generated by shortid module
});

// objSchema.plugin(MpathPlugin,{
//   pathSeparator : '#',              // Default path separator
//   onDelete :      'DELETE',       // Can be set to 'DELETE' or 'REPARENT'. Default: 'REPARENT'
//   idType:         objSchema._id  // Type used for _id. Can be, for example, String generated by shortid module
// });

objSchema.plugin(slugGenerator);
objSchema.plugin(inOrder);



const Category = mongoose.model('Category', objSchema);

module.exports.Category = Category;
