var mongoose = require('mongoose')
var Checkout = require('../../Models/checkout')
var Coupon = require('../../Models/coupon')
var User = require('../../Models/user')
var Cart = require('../../Models/cart')




const { Validator } = require('node-input-validator')


const viewAll = async (req,res)=>{
    return Checkout.aggregate(
        [
            {
                $match: {
                    user_id: mongoose.Types.ObjectId(req.params.user_id),
                },
            },
            {
                $lookup:{
                    from:"carts",//
                    localField:"order_id",//
                    foreignField:"order_id",
                    as:"cart_data"//
                }
            },
            {
                $project:{
                    _v:0
                }
            }
        ]
    )
    .then((docs)=>{
        res.status(200).json({
            status: true,
            message: "Order History get successfully",
            data: docs
        })
    })
    .catch((err)=>{
        res.status(500).json({
            status: false,
            message: "Server error. Please try again.",
            error: err
        })
    })
}

const refundProduct = async (req, res) => {
    return Checkout.findOneAndUpdate(
      { _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } },
      {status:'cancel'},
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
            message: "Order Cancel successful",
            data: data,
          });
        } else {
          res.status(500).json({
            status: false,
            message: "Server Error",
            data: null,
          });
        }
      }
    );
  };


module.exports = {
    viewAll,
    refundProduct
}