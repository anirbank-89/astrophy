const mongoose = require("mongoose");
const Cart = require("../../Models/cart");
var Coupon = require("../../Models/coupon");
const Checkout = require("../../Models/checkout");

const { Validator } = require("node-input-validator");

const create = async (req, res) => {
  const v = new Validator(req.body, {
    user_id: "required",
    subtotal: "required",
    discount_percent: "required",
    total: "required",
    coupon_id: "required",
    firstname: "required",
    lastname: "required",
    address1: "required",
    address2: "required",
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
    subtotal: req.body.subtotal,
    discount_percent: req.body.discount_percent,
    total: req.body.total,
    coupon_id: req.body.coupon_id,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    address1: req.body.address1,
    address2: req.body.address2,
    country: req.body.country,
    state: req.body.state,
    zip: req.body.zip,
    paymenttype: req.body.paymenttype,
  };
  console.log(dataSubmit);

  let coupData = await Coupon.findOne({
    _id: mongoose.Types.ObjectId(req.body.coupon_id),
    status: true,
  }).exec();
  
  const saveData = new Checkout(dataSubmit);
  return saveData
    .save()
    .then((data) => {
      Cart.updateMany(
        { user_id: mongoose.Types.ObjectId(req.body.user_id), status: true },
        { $set: { status: false, order_id: data.order_id } },
        { multi: true },
        (err, writeResult) => {
          // console.log(err);
        }
      );
    
      let coupLimit = parseInt(coupData.times) - parseInt(1);
      Coupon.updateMany(
        { _id: mongoose.Types.ObjectId(req.body.coupon_id)},
        { $set: { times: coupLimit } },
        { multi: true },
        (err, writeResult) => {
          // console.log(err);
        }
      );

      res.status(200).json({
        status: true,
        message: "Item Added to Successfully",
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        message: "Server error. Please try again.",
        error: err,
      });
    });
};

const checkCoupon = async (req, res) => {
  let coupData = await Coupon.findOne({
    name: req.body.name,
    status: true,
  }).exec();
  // console.log(coupData)
  if (coupData != "" && coupData != null) {
    return res.status(200).json({
      status: true,
      data: coupData,
      message: "Coupon get successfully",
    });
  } else {
    return res.status(400).json({
      status: false,
      data: null,
      message: "No Data",
    });
  }
};

module.exports = {
  create,
  checkCoupon,
};
