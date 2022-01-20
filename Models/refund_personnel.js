var mongoose = require('mongoose');
var passwordHash = require('password-hash');


const REFUND_PERSONNEL = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    fullname:{
        type:String,
        required:false // false
    },
    email:{
        type:String,
        required:false
        // unique: true
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
    admin_type: {
        type: String,
        default: "refund_personnel"
    },
    token:{
        type:String,
        required:false,
        unique:true
    },
    status: {
        type: Boolean,
        default: true
    }

})
REFUND_PERSONNEL.methods.comparePassword = function (candidatePassword) {
    return passwordHash.verify(candidatePassword, this.password);
  };
module.exports = mongoose.model("refund_personnel",REFUND_PERSONNEL);