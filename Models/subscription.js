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
  seller_comission_type: {
    type: String,
    required: true,
  },
  seller_commission_value: {
    type: Number,
    required: true
  },
  duration: {
    start_date:{
      type: String,
      required: true,
    },
    end_date:{
      type: String,
      required: true,
    },
  },
  price: {
    type: Number,
    required: true,
  },
  // type: {
  //   type: String,
  //   required: false,
  // },
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
