var mongoose = require('mongoose');
var moment = require("moment-timezone");
var dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");

const ContactusSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    subcat_id: mongoose.Schema.Types.ObjectId,
    message: String,
    rciv_mail: {
        type: String,
        default: 'tesdata.stack@gmail.com'
    },
    reply: String,
    status:{
        type:Boolean,
        default: true
    },
    created_on: {
        type: Date,
        default: dateKolkata,
    },

})

  module.exports = mongoose.model("Contactus",ContactusSchema)