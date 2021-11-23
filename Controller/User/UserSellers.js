var mongoose = require('mongoose');
var User = require("../../Models/user");
var Shop = require("../../Models/shop");
var ShopServices = require('../../Models/shop_service');
const Servicecommission = require("../../Models/servicecommission");

const { Validator } = require('node-input-validator');
// const { stringify } = require('uuid');

const viewUser = async (req,res)=>{
    let id=req.params.id;
    User.findOne(
        {_id: { $in : [mongoose.Types.ObjectId(id)] } }, 
        async (err,docs)=>{
        if(err){
            res.status(500).json({
                status: false,
                message: "Server error. Data not available",
                error: err
            });
        }
        else {
            // console.log("user", docs);
            // console.log("shop", data);
            Shop.find({userid: {$in: [mongoose.Types.ObjectId(id)]}})
              .then((data)=>{
                  if(data==null || data==''){
                    res.status(200).json({
                        status: true,
                        message: "User successfully get. User doesn't have a shop",
                        data: docs,
                        shop_id: null
                    })
                  }
                  else{
                    console.log("Shop", data)
                    let seller = docs;
                    console.log("Seller", seller)
                    let shop = data[0]
                    seller.shop_id = shop._id
                      res.status(200).json({
                          status: true,
                          message: "User and shop id successfully get",
                          data: seller,
                          shop_id: seller.shop_id
                    })
                  }
              })
              .catch((err)=>{
                  res.status(200).json({
                      status: false,
                      message: "Server error. Please try again later",
                      error: err
                  })
              })

        }
    });
}

const viewUserList = async (req,res)=>{
    return User.find(
        {type: { $in : "User" } },
        (err,docs)=>{
            if(err){
                res.status(400).json({
                    status: false,
                    message: "Server error. Data not available",
                    error: err
                });
            }
            else {
                res.status(200).json({
                    status: true,
                    message: "Users get successfully",
                    data: docs
                });
            }
        });
}

const viewSellerList = async (req,res)=>{
    return User.find(
        {type: { $in : "Seller" } },
        (err,docs)=>{
            if(err){
                res.status(400).json({
                    status: false,
                    message: "Server error. Data not available",
                    error: err
                });
            }
            else {
                res.status(200).json({
                    status: true,
                    message: "Sellers get successfully",
                    data: docs
                });
            }
        });
}

const sellercomHistory = async (req, res) => {
    return Servicecommission.aggregate([
        {
            $match: { seller_id: { $in: [mongoose.Types.ObjectId(req.params.id)] } },
          },
      {
        $project: {
          _v: 0,
        },
      },
      {
        $lookup: {
          from: "servicecheckouts",
          localField: "order_id",
          foreignField: "_id",
          as: "booking_data",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "seller_id",
          foreignField: "_id",
          as: "seller_data",
        },
      },
      { $sort: { _id: -1 } },
    ])
      .then((data) => {
        if (data != null && data != "") {
          res.status(200).send({
            status: true,
            data: data,
            error: null,
            message: "Comission history Get Successfully",
          });
        } else {
          res.status(400).send({
            status: false,
            data: null,
            error: "No Data",
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          status: false,
          data: null,
          error: err,
          message: "Server Error",
        });
      });
  };

  const totalandpendingcomission = async (req, res) => {
    let com = await Servicecommission.find({ seller_id: { $in: [mongoose.Types.ObjectId(req.params.id)] } }).exec();
    // console.log(com)
    let total_com = 0;
    let settled_com = 0;

    com.forEach(element=>{
        total_com = parseInt(total_com)+parseInt(element.seller_commission);
        if(element.status === true)
        {
            settled_com = parseInt(settled_com)+parseInt(element.seller_commission);
        }
    })

    return res.send({
        status:true,
        total_comission:total_com,
        setteld_commission:settled_com
    })
  };

  const applyWithdraw = async (req, res) => {

    return Servicecommission.findOneAndUpdate(
        { _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } },
        req.body,
        { new: true },
        async (err, docs) => {
            if (err) {
                res.status(500).json({
                    status: false,
                    message: "Server error. Please try again.",
                    error: err
                });
            }
            else if (docs != null) {
                res.status(200).json({
                    status: true,
                    message: "Withdrawl Request successfully!",
                    data: docs
                });
            }
            else {
                res.status(500).json({
                    status: false,
                    message: "User do not match",
                    data: null
                });
            }
        }
    );
}

module.exports = {
    viewUser,
    viewUserList,
    viewSellerList,
    sellercomHistory,
    totalandpendingcomission,
    applyWithdraw
}