const mongoose = require("mongoose");

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
  status: {
    type: Boolean,
    required: false,
    default: true,
  },
});

module.exports = mongoose.model("Subscription", SubscriptionSchema);
