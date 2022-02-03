const mongoose = require("mongoose");
var moment = require("moment-timezone");
var dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");

const SubscriptionSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  // seller_comission_type: {
  //   type: String,
  //   required: true,
  // },
  // range:{
  //     type: Object,
  //     required: true,
  //   },
  duration: {
    type: String,
    required: true
  },
  country: {
    type: Object,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
  },
  seller_commission_value: {
    type: Number,
    required: true
  },
  type: String,
  no_of_listing: Number,
  plan_id: String,
  status: {
    type: Boolean,
    default: true,
  },
  created_on: {
    type: Date,
    default: dateKolkata
  }
});

module.exports = mongoose.model("subscription", SubscriptionSchema);
