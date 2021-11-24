var mongoose = require('mongoose');
var User = require("../../Models/user");
var Shop = require("../../Models/shop");
var ShopServices = require('../../Models/shop_service');
const Servicecommission = require("../../Models/servicecommission");
const Withdraw = require("../../Models/withdraw");
const Totalcomission = require("../../Models/totalcomission");


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
    let com = await totalcomissions.find({ seller_id: { $in: [mongoose.Types.ObjectId(req.params.id)] } }).exec();
    // console.log(com)

    return res.send({
        status:true,
        data:com
    })
  };

  const applyWithdraw = async (req, res) => {
    let totalcomission = await Totalcomission.findOne({seller_id:mongoose.Types.ObjectId(req.body.seller_id)}).exec();
    let pend_com = 0;
    let withdrawcomission = await Withdraw.find({seller_id:mongoose.Types.ObjectId(req.body.seller_id),paystatus:false}).exec();
    if(withdrawcomission.length>0)
    {
    withdrawcomission.forEach(element=>{
      pend_com = parseInt(pend_com) + parseInt(element.amount)
    })
    }

    let checkCom = parseInt(pend_com)+parseInt(req.body.amount)
    console.log(pend_com)
    // return false;
    if(req.body.amount>totalcomission.comission_total)
    {
      return res.send({
        status:false,
        data:null,
        error:true,
        message:"Amount Exceeds Total Earning"
    })
    }
    else if(checkCom > totalcomission.comission_total)
    {
      return res.send({
        status:false,
        data:null,
        error:true,
        message:"Amount Exceeds Total Earning"
      })
    }
    else{
        let obj = {
          _id: mongoose.Types.ObjectId(),
          seller_id: mongoose.Types.ObjectId(req.body.seller_id),
          amount: req.body.amount,
          paystatus:false
        }
        const saveCom = new Withdraw(obj);
        saveCom.save()
        return res.send({
          status:true,
          data:null,
          error:false,
          message:"Comission Saved Successfully"
        })
    }

  }

  const withdrawHistory = async (req, res) => {
    return Withdraw.aggregate([
        {
            $match: { seller_id: { $in: [mongoose.Types.ObjectId(req.params.id)] } },
          },
      {
        $project: {
          _v: 0,
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
            message: "Withdraw history Get Successfully",
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

module.exports = {
    viewUser,
    viewUserList,
    viewSellerList,
    sellercomHistory,
    totalandpendingcomission,
    applyWithdraw,
    withdrawHistory
}