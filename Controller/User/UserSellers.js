var mongoose = require('mongoose');
var User = require("../../Models/user");
var Shop = require("../../Models/shop");

const { Validator } = require('node-input-validator');
// const { stringify } = require('uuid');

const viewUser = async (req,res)=>{
    let id=req.params.id;
    User.findOne(
        {_id: { $in : [mongoose.Types.ObjectId(id)] } }, 
        (err,docs)=>{
        if(err){
            res.status(500).json({
                status: false,
                message: "Server error. Data not available",
                error: err
            });
        }
        else {
            Shop.findOne({userid: {$in: [mongoose.Types.ObjectId(id)]}})
              .then((data)=>{
                  if(data!=null || data!=''){
                      console.log("Shop", data)
                      let seller = docs;
                      let shop = data
                      seller.shop_id = shop._id
                      console.log("Seller", seller.shop_id)
                        res.status(200).json({
                            status: true,
                            message: "User successfully get",
                            data: seller,
                            shop_id: seller.shop_id
                      })
                  }
              })
              .catch((err)=>{
                  res.status(200).json({
                      status: false,
                      message: "User doesn't have a shop",
                      error: err,
                      data: docs
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

module.exports = {
    viewUser,
    viewUserList,
    viewSellerList
}