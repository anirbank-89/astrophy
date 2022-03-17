const mongoose = require("mongoose");
const { Validator } = require("node-input-validator");

var Cart = require("../../Models/cart");
var Wishlist = require("../../Models/wishlist");
var Coupon = require("../../Models/coupon");
var Checkout = require("../../Models/checkout");

const addToCart = async (req, res) => {
  const v = new Validator(req.body, {
    user_id: "required",
    prod_id: "required",
    productname: "required",
    qty: "required",
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

  let subData = await Cart.findOne({
    user_id: mongoose.Types.ObjectId(req.body.user_id),
    prod_id: mongoose.Types.ObjectId(req.body.prod_id),
    status: true
  }).exec();
  if (subData == null || subData == "") {

    let WishData = await Wishlist.findOne({
      user_id: mongoose.Types.ObjectId(req.body.user_id),
      prod_id: mongoose.Types.ObjectId(req.body.prod_id),
    }).exec();
    if (WishData != null || WishData != "") {
      Wishlist.remove(
        {
          user_id: mongoose.Types.ObjectId(req.body.user_id),
          prod_id: mongoose.Types.ObjectId(req.body.prod_id),
        },
        function (err, result) { }
      );
    }
    let dataSubmit = {
      _id: mongoose.Types.ObjectId(),
      user_id: mongoose.Types.ObjectId(req.body.user_id),
      prod_id: mongoose.Types.ObjectId(req.body.prod_id),
      productname: req.body.productname,
      qty: req.body.qty,
      price: req.body.price,
      image: req.body.image,
    };

    const saveData = new Cart(dataSubmit);
    return saveData
      .save()
      .then((data) => {
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
  } else {
    return res.status(400).json({
      status: false,
      data: null,
      message: "Item Already Added",
    });
  }
};

const updateCart = async (req, res) => {
  return Cart.findOneAndUpdate(
    { _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } },
    req.body,
    { new: true },
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
};

const getCart = async (req, res) => {
  return Cart.aggregate([
    {
      $match: {
        user_id: mongoose.Types.ObjectId(req.params.user_id),
        status: true
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "prod_id",
        foreignField: "_id",
        as: "product_data"
      }
    },
    {
      $lookup: {
        from: "coupons",
        localField: "coupon",
        foreignField: "name",
        as: "coupon_data"
      }
    },
    {
      $project: {
        // _id: 0,

        __v: 0,
      },
    },
  ])
    .then((data) => {
      if (data.length > 0) {
        return res.status(200).json({
          status: true,
          message: "Cart Listing Successfully",
          data: data,
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "Empty Cart",
          data: data,
        });
      }
    })
    .catch((err) => {
      return res.status(500).json({
        status: false,
        message: "No Match",
        data: null,
      });
    });
};

const Delete = async (req, res) => {
  return Cart.remove({ _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } })
    .then((data) => {
      return res.status(200).json({
        status: true,
        message: "Cart Item delete successfully",
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        message: "Server error. Please try again.",
        error: error,
      });
    });
};

const applyCoupon = async (req, res) => {
  var coup_name = req.body.name;
  var user_id = req.body.user_id;

  let coupData = await Coupon.findOne({
    name: coup_name,
    status: true,
  }).exec();
  // console.log(coupData)

  if (coupData.times == 0) {
    return res.status(500).json({
      status: false,
      error: "This coupon is not available anymore.",
      data: null
    });
  }
  else {
    let couponUsedOrNot = await Checkout.findOne({
      user_id: mongoose.Types.ObjectId(user_id),
      "coupon._id": coupData._id
    }).exec();

    if (couponUsedOrNot != null || typeof couponUsedOrNot != "undefined") {
      return res.status(500).json({
        status: false,
        error: "This coupon has already been used.",
        data: null
      });
    }
    else {
      Cart.updateMany(
        {
          user_id: mongoose.Types.ObjectId(user_id),
          status: true
        },
        { $set: { coupon: coup_name } },
        { multi: true },
        (err, docs) => {
          if (err) {
            console.log("Failed to update in cart due to ", err.message);
          }
        }
      ).exec();

      coupData.times -= 1;
      let availableCoupNum = await coupData.save();

      return res.status(200).json({
        status: true,
        message: "Applied coupon info.",
        data: coupData
      });
    }
  }
}

module.exports = {
  addToCart,
  getCart,
  updateCart,
  Delete,
  applyCoupon
};
