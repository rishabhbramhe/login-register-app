var mongoose = require("mongoose");
var plm = require("passport-local-mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/databasename");

var userSchema = mongoose.Schema({
  username:String,
  password:String,
  email:String,
  number:Number,
  profile:{
    type:String,
    default:"def.png"
  },

  like: {
    default:[],
    type:Array
  }
});
userSchema.plugin(plm); 
module.exports=mongoose.model("user",userSchema);