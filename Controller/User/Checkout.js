const mongoose = require("mongoose");
const Cart = require("../../Models/cart");
var Coupon = require("../../Models/coupon");
const Checkout = require("../../Models/checkout");

const { Validator } = require("node-input-validator");

const create = async (req, res) => {
  const v = new Validator(req.body, {
    user_id: "required",
    subtotal: "required",
    total: "required",
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
    subtotal: req.body.subtotal,
    total: req.body.total,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    address1: req.body.address1,
    country: req.body.country,
    state: req.body.state,
    zip: req.body.zip,
    paymenttype: req.body.paymenttype,
  };
  
  if (
    req.body.coupon_id != "" &&
    req.body.coupon_id != null &&
    typeof req.body.coupon_id != undefined
  ) {
    dataSubmit.coupon_id = mongoose.Types.ObjectId(req.body.coupon_id);
  }
  if (
    req.body.discount_percent != "" &&
    req.body.discount_percent != null &&
    typeof req.body.discount_percent != undefined
  ) {
    dataSubmit.discount_percent = req.body.discount_percent;
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

  if(req.body.tokenid!='' && typeof req.body.tokenid!=undefined)
    {
      dataSubmit.tokenid = req.body.tokenid
    }
  console.log(dataSubmit);
  //   return false;
  if (
    req.body.coupon_id != "" &&
    req.body.coupon_id != null &&
    typeof req.body.coupon_id != undefined
  ) {
    let coupData = await Coupon.findOne({
      _id: mongoose.Types.ObjectId(req.body.coupon_id),
      status: true,
    }).exec();
    let coupLimit = parseInt(coupData.times) - parseInt(1);
    Coupon.updateMany(
      { _id: mongoose.Types.ObjectId(req.body.coupon_id) },
      { $set: { times: coupLimit } },
      { multi: true },
      (err, writeResult) => {
        // console.log(err);
      }
    );
  }

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
