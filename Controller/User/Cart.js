const mongoose = require("mongoose");
const Cart = require("../../Models/cart");
const Product = require("../../Models/product");
var User = require("../../Models/user");
var Wishlist = require("../../Models/wishlist");
var Coupon = require("../../Models/coupon");


const { Validator } = require("node-input-validator");

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
    status:true
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
        function (err, result){}
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
};

const getCart = async (req, res) => {
  return Cart.aggregate([
    {
      $match: {
        user_id: mongoose.Types.ObjectId(req.params.user_id),
        status :true
      },
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

const checkCoupon = async(req,res)=>
{
  let coupData = await Coupon.findOne({
    name: req.body.name,
    status: true,
  }).exec();
  // console.log(coupData)
  if(coupData!='' && coupData !=null)
  {
    return res.status(200).json({
      status:true,
      data:coupData,
      message:"Coupon get successfully"
    })
  }
  else
  {
    return res.status(400).json({
      status:false,
      data:null,
      message:"No Data"
    })
  }
}

module.exports = {
  addToCart,
  getCart,
  updateCart,
  Delete,
  checkCoupon
};
