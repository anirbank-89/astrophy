const mongoose = require("mongoose");
var moment = require("moment-timezone");
const { Double } = require("bson");
var dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");

const WithdrawSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  // seller_id:mongoose.Schema.Types.ObjectId,
  // amount: {
  //   type: Number
  // },
  // paystatus: {
  //   type: Boolean,
  //   default: false
  // },
  // transactionid: {
  //   type: String
  // },
  // image: {
  //   type: String
  // },
  // created_on: {
  //   type: Date,
  //   default: dateKolkata,
  // },
  // paydate_on: {
  //   type: String,
  //   default: null,
  // }
  order_id: mongoose.Schema.Types.ObjectId,
  seller_id: mongoose.Schema.Types.ObjectId,
  commision_type: {
    type: String,
    required: true
  },
  commision_value: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  seller_commission: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: false,
    default: null
  },
  txnid: {
    type: String,
    required: false,
    default: null
  },
  // status: {
  //   type: Boolean,
  //   default: false
  // },
  // sellerapply: {
  //   type: Boolean,
  //   default: false
  // },
  // paystatus: {
  //   type: Boolean,
  //   default: false
  // },
  created_on: {
    type: Date,
    default: dateKolkata,
  }
});

module.exports = mongoose.model("Withdraw", WithdrawSchema);
