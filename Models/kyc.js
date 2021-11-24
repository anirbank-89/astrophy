const mongoose = require("mongoose");
var moment = require("moment-timezone");
const { Double } = require("bson");
var dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");

const KycSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  seller_id:mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required:true
  },
  account: {
    type: Number,
    required:true
  },
  iifsc: {
    type: String,
    required:true
  },
  bank: {
    type: String,
    required:true
  },
  created_on: {
    type: Date,
    default: dateKolkata,
}
});

module.exports = mongoose.model("Kyc", KycSchema);
