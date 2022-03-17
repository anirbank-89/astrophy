const mongoose = require("mongoose");
const { Validator } = require("node-input-validator");

const Cart = require("../../Models/cart");
const Coupon = require("../../Models/coupon");
const Checkout = require("../../Models/checkout");
const UserAddresses = require('../../Models/user_address');

const create = async (req, res) => {
  const v = new Validator(req.body, {
    user_id: "required",
    total: "required",
    subtotal: "required",
    firstname: "required",
    lastname: "required",
    address1: "required",
    country: "required",
    state: "required",
    zip: "required",
    paymenttype: "required",
  });

  let matched = await v.check().then((val) => val);
  if (!matched) {
    return res.status(400).json({
      status: false,
      data: null,
      message: v.errors,
    });
  }

  let dataSubmit = {
    _id: mongoose.Types.ObjectId(),
    user_id: mongoose.Types.ObjectId(req.body.user_id),
    order_id: Number(
      `${new Date().getDate()}${new Date().getHours()}${new Date().getSeconds()}${new Date().getMilliseconds()}`
    ),
    total: req.body.total,
    subtotal: req.body.subtotal,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    address1: req.body.address1,
    country: req.body.country,
    state: req.body.state,
    zip: req.body.zip,
    paymenttype: req.body.paymenttype,
  };

  if (
    req.body.discount_percent != "" &&
    req.body.discount_percent != null &&
    typeof req.body.discount_percent != undefined
  ) {
    dataSubmit.discount_percent = req.body.discount_percent;
  }
  if (
    req.body.coupon_id != "" &&
    req.body.coupon_id != null &&
    typeof req.body.coupon_id != undefined
  ) {
    dataSubmit.coupon_id = mongoose.Types.ObjectId(req.body.coupon_id);
  }
  if (
    req.body.coupon_type != "" &&
    req.body.coupon_type != null &&
    typeof req.body.coupon_type != undefined
  ) {
    dataSubmit.coupon_type = req.body.coupon_type;
  }
  if (
    req.body.coupon != "" &&
    req.body.coupon != null &&
    typeof req.body.coupon != undefined
  ) {
    dataSubmit.coupon = req.body.coupon;
  }
  if (
    req.body.address2 != "" &&
    req.body.address2 != null &&
    typeof req.body.address2 != undefined
  ) {
    dataSubmit.address2 = req.body.address2;
  }

  if (req.body.tokenid != '' && typeof req.body.tokenid != undefined) {
    dataSubmit.tokenid = req.body.tokenid
  }
  if (req.body.shipping_address != "" || req.body.shipping_address != null || typeof req.body.shipping_address != "undefined") {
    dataSubmit.shipping_address = req.body.shipping_address;
  }
  if (req.body.address_future_use != "" || req.body.address_future_use != null || typeof req.body.address_future_use != "undefined") {
    dataSubmit.address_future_use = req.body.address_future_use;
  }
  console.log(dataSubmit);

  const saveData = new Checkout(dataSubmit);
  return saveData
    .save()
    .then(async (data) => {
      // Update the cart items with order id and other details
      Cart.updateMany(
        { user_id: mongoose.Types.ObjectId(req.body.user_id), status: true },
        { $set: {
          status: false, 
          order_id: data.order_id,
          discount_percent: data.discount_percent,
          buy_date: data.booking_date
        } },
        { multi: true },
        (err, writeResult) => {
          // console.log(err);
        }
      );
      // Decrease the number of coupon used in the checkout
      let coupData = await Coupon.findOne(
        {
          name: data.coupon.name,
          status: true
        }
      ).exec();

      coupData.times -= 1;
      coupData.save();

      // Save billing and/or shipping address
      if (data.address_future_use != "" || data.address_future_use != null || typeof data.address_future_use != "undefined") {
        let billingDetails = await UserAddresses.findOne({ userid: data.user_id, future_use: true }).exec();

        if (billingDetails == null) {
          let billingData = {
            _id: mongoose.Types.ObjectId(),
            userid: data.user_id,
            firstname: data.firstname,
            lastname: data.lastname,
            address1: data.address1,
            state: data.state,
            country: data.country,
            zip: data.zip,
            future_use: data.address_future_use
          }
          if (data.address2 != "" || data.address2 != null || typeof data.address2 != "undefined") {
            billingData.address2 = data.address2;
          }
          if (data.shipping_address != "" || data.shipping_address != null || typeof data.shipping_address != "undefined") {
            billingData.shipping = data.shipping_address;
          }

          const NEW_BILLING_ADDRESS = new UserAddresses(billingData);
          NEW_BILLING_ADDRESS.save();
        }
        else {
          billingDetails.delete();

          let billingData = {
            _id: mongoose.Types.ObjectId(),
            userid: data.user_id,
            firstname: data.firstname,
            lastname: data.lastname,
            address1: data.address1,
            state: data.state,
            country: data.country,
            zip: data.zip,
            future_use: data.address_future_use
          }
          if (data.address2 != "" || data.address2 != null || typeof data.address2 != "undefined") {
            billingData.address2 = data.address2;
          }
          if (data.shipping_address != "" || data.shipping_address != null || typeof data.shipping_address != "undefined") {
            billingData.shipping = data.shipping_address;
          }

          const NEW_BILLING_ADDRESS = new UserAddresses(billingData);
          NEW_BILLING_ADDRESS.save();
        }
      }
      else {
        let billingData = {
          _id: mongoose.Types.ObjectId(),
          userid: data.user_id,
          firstname: data.firstname,
          lastname: data.lastname,
          address1: data.address1,
          state: data.state,
          country: data.country,
          zip: data.zip
        }
        if (data.address2 != "" || data.address2 != null || typeof data.address2 != "undefined") {
          billingData.address2 = data.address2;
        }
        if (data.shipping_address != "" || data.shipping_address != null || typeof data.shipping_address != "undefined") {
          billingData.shipping = data.shipping_address;
        }

        const NEW_BILLING_ADDRESS = new UserAddresses(billingData);
        NEW_BILLING_ADDRESS.save();
      }

      res.status(200).json({
        status: true,
        message: "Order Placed Successfully",
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        message: "Server error. Please try again.",
        error: err.message,
      });
    });
};

module.exports = {
  create
}
