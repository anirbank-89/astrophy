var mongoose = require('mongoose');
var passwordHash = require('password-hash');


const AdminSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    fullname:{
        type:String,
        required:false
    },
    email:{
        type:String,
        required:false,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:false,
        default:null
    },
    address:{
        type:String,
        required:false,
        default:null
    },
    image:{
        type:String,
        required:false,
        default:null
    },
    token:{
        type:String,
        required:false,
        unique:true
    }

})
AdminSchema.methods.comparePassword = function (candidatePassword) {
    return passwordHash.verify(candidatePassword, this.password);
  };
  module.exports = mongoose.model("Admin",AdminSchema)