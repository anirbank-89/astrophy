const mongoose = require("mongoose");
var moment = require("moment-timezone");
const { Double } = require("bson");
var dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");

const WithdrawSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  seller_id:mongoose.Schema.Types.ObjectId,
  amount: {
    type: Number
  },
  paystatus: {
    type: Boolean,
    default: false
  },
  transactionid: {
    type: String
  },
  image: {
    type: String
  },
  created_on: {
    type: Date,
    default: dateKolkata,
  },
  paydate_on: {
    type: String,
    default: null,
  }
});

module.exports = mongoose.model("Withdraw", WithdrawSchema);
