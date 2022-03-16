var mongoose = require("mongoose");
const { Validator } = require("node-input-validator");

const NEW_SERVIECART = require("../../Models/new_servicecart");
const SERVICE_COUPON = require("../../Models/servicecoupon");

const addToServiceCart = async (req, res) => {
  const v = new Validator(req.body, {
    user_id: "required",
    serv_id: "required",
    seller_id: "required",
    servicename: "required",
    price: "required",
    image: "required",
  });

  let matched = await v.check().then((val) => val);
  if (!matched) {
    return res.status(400).json({
      status: false,
      data: null,
      message: v.errors,
    });
  }

  let subData = await NEW_SERVIECART.findOne({
    user_id: mongoose.Types.ObjectId(req.body.user_id),
    serv_id: mongoose.Types.ObjectId(req.body.serv_id),
    status: true
  }).exec();
  if (subData == null || subData == "") {


    let dataSubmit = {
      _id: mongoose.Types.ObjectId(),
      user_id: mongoose.Types.ObjectId(req.body.user_id),
      serv_id: mongoose.Types.ObjectId(req.body.serv_id),
      seller_id: mongoose.Types.ObjectId(req.body.seller_id),
      servicename: req.body.servicename,
      price: req.body.price,
      image: req.body.image,
    }
    if (req.body.currency != null || req.body.currency != "" || typeof req.body.currency != "undefined") {
      dataSubmit.currency = req.body.currency;
    }

    const saveData = new NEW_SERVIECART(dataSubmit);
    return saveData
      .save()
      .then((data) => {
        res.status(200).json({
          status: true,
          message: "service Added to Successfully",
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
  } else {
    return res.status(400).json({
      status: false,
      data: null,
      message: "service Already Added",
    });
  }
};

/*const updateServiceCart = async (req, res) => {
  return Cart.findOneAndUpdate(
    { _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } },
    req.body,
    {new: true},
    async (err, data) => {
      if (err) {
        res.status(500).json({
          status: false,
          message: "Server error. Please try again.",
          error: err,
        });
      } else if (data != null) {
        // data = { ...req.body, ...data._doc };
        res.status(200).json({
          status: true,
          message: "Cart update successful",
          data: data,
        });
      } else {
        res.status(500).json({
          status: false,
          message: "Item not match",
          data: null,
        });
      }
    }
  );
};*/

const getServiceCart = async (req, res) => {
  var user_id = req.params.user_id;

  let cartData = await NEW_SERVIECART.aggregate([
    {
      $match: {
        user_id: mongoose.Types.ObjectId(user_id),
        status: true
      },
    },
    {
      $lookup: {
        from: "shop_services",
        localField: "serv_id",
        foreignField: "_id",
        as: "service_data"
      }
    },
    {
      $lookup: {
        from: "servicecoupons",
        localField: "coupon_id",
        foreignField: "_id",
        as: "coupon_data"
      }
    },
    {
      $unwind: "$coupon_data"
    },
    {
      $project: {
        // _id: 0,

        __v: 0,
      },
    },
  ]).exec();

  // let couponData = await SERVICE_COUPON.findOne({
  //   name: req.body.coupon_name,
  //   status: true
  // }).exec();

  if (cartData.length > 0) {
    return res.status(200).json({
      status: true,
      message: "Data successfully get.",
      data: cartData,
    });
  }
  else {
    return res.status(200).json({
      status: true,
      message: "Empty service cart.",
      data: cartData
    });
  }
};

const Delete = async (req, res) => {
  var id = req.params.id;

  return NEW_SERVIECART.findOneAndDelete({ _id: mongoose.Types.ObjectId(id) })
    .then((data) => {
      return res.status(200).json({
        status: true,
        message: "Service Cart Item delete successfully",
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        message: "Invalid id. Server error.",
        error: error,
      });
    });
};

module.exports = {
  addToServiceCart,
  getServiceCart,
  //updateServiceCart,
  Delete
};
