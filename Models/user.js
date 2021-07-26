const mongoose = require('mongoose');
const passwordHash = require('password-hash');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    _id:Schema.Types.ObjectId,
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    phone:{
        type: Number,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    token:{
        type:String,
        required:false,
        unique:true
    },
    type:{
        type:String,
        required:false,
        dafault:'User'
    }
});
UserSchema.methods.comparePassword = function (candidatePassword) {
    return passwordHash.verify(candidatePassword, this.password);
}

module.exports = mongoose.model("User", UserSchema);