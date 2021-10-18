const mongoose = require("mongoose");
var moment = require("moment-timezone");
var dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");

const SubscriptionSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  seller_comission: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  no_of_listing:{
    type: Number,
    required: true
  },
  plan_id:{
    type: String,
    required: false,
    default:null
  },
  status: {
    type: Boolean,
    required: false,
    default: true,
  },
  created_on: {
    type: Date,
    default: dateKolkata,
}
});

module.exports = mongoose.model("Subscription", SubscriptionSchema);
