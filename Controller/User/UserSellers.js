var mongoose = require('mongoose');
var User = require("../../Models/user");
var Shop = require("../../Models/shop");
var ShopServices = require('../../Models/shop_service');
const Servicecommission = require("../../Models/servicecommission");
const Withdraw = require("../../Models/withdraw");
const Totalcomission = require("../../Models/totalcomission");
const Kyc = require("../../Models/kyc");
const moment = require("moment");

const SELLER = require('../../Models/seller');
var Upload = require('../../service/upload');

const { Validator } = require('node-input-validator');
// const { stringify } = require('uuid');

const viewUser = async (req, res) => {
  let id = req.params.id;
  User.findOne(
    { _id: { $in: [mongoose.Types.ObjectId(id)] } },
    async (err, docs) => {
      if (err) {
        res.status(500).json({
          status: false,
          message: "Server error. Data not available",
          error: err
        });
      }
      else {
        // console.log("user", docs);
        // console.log("shop", data);
        Shop.find({ userid: { $in: [mongoose.Types.ObjectId(id)] } })
          .then((data) => {
            if (data == null || data == '') {
              res.status(200).json({
                status: true,
                message: "User successfully get. User doesn't have a shop",
                data: docs,
                shop_id: null
              })
            }
            else {
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
          .catch((err) => {
            res.status(200).json({
              status: false,
              message: "Server error. Please try again later",
              error: err
            })
          })

      }
    });
}

const viewUserList = async (req, res) => {
  return User.find(
    { type: { $in: "User" } },
    (err, docs) => {
      if (err) {
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

const viewSellerList = async (req, res) => {
  return User.find(
    { type: { $in: "Seller" } },
    (err, docs) => {
      if (err) {
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
  let com = await Totalcomission.find({ seller_id: { $in: [mongoose.Types.ObjectId(req.params.id)] } }).exec();
  // console.log(com)

  return res.send({
    status: true,
    data: com
  })
};

const applyWithdraw = async (req, res) => {
  let totalcomission = await Totalcomission.findOne({ seller_id: mongoose.Types.ObjectId(req.body.seller_id) }).exec();
  let pend_com = 0;
  let withdrawcomission = await Withdraw.find({ seller_id: mongoose.Types.ObjectId(req.body.seller_id), paystatus: false }).exec();
  if (withdrawcomission.length > 0) {
    withdrawcomission.forEach(element => {
      pend_com = parseInt(pend_com) + parseInt(element.amount)
    })
  }

  let checkCom = parseInt(pend_com) + parseInt(req.body.amount)
  console.log(pend_com)
  // return false;
  if (req.body.amount > totalcomission.comission_total) {
    return res.send({
      status: false,
      data: null,
      error: true,
      message: "Amount Exceeds Total Earning"
    })
  }
  else if (checkCom > totalcomission.comission_total) {
    return res.send({
      status: false,
      data: null,
      error: true,
      message: "Amount Exceeds Total Earning"
    })
  }
  else {
    let obj = {
      _id: mongoose.Types.ObjectId(),
      seller_id: mongoose.Types.ObjectId(req.body.seller_id),
      amount: req.body.amount,
      paystatus: false
    }
    const saveCom = new Withdraw(obj);
    saveCom.save()
    return res.send({
      status: true,
      data: null,
      error: false,
      message: "Comission Saved Successfully"
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

const kyccreateNUpdate = async (req, res) => {
  const v = new Validator(req.body, {
    name: 'required',
    account: 'required',
    iifsc: 'required',
    bank: 'required'
  });
  let matched = await v.check().then((val) => val)
  if (!matched) {
    res.status(200).send({ status: false, error: v.errors });
  }

  console.log(req.body);
  // return false;
  let shopData = await Kyc.find({ seller_id: { $in: [mongoose.Types.ObjectId(req.body.seller_id)] } }).exec();
  console.log(shopData.length)
  // return false;
  //   .then((data)=>{
  if (shopData.length == 0) {
    //bn


    let shopData = {
      _id: mongoose.Types.ObjectId(),
      name: req.body.name,
      account: req.body.account,
      iifsc: req.body.iifsc,
      bank: req.body.bank,
      seller_id: mongoose.Types.ObjectId(req.body.seller_id)
    }

    const shop_owner = new Kyc(shopData)

    shop_owner.save().then((docs) => {
      res.status(200).json({
        status: true,
        success: true,
        message: "Kyc successfully created",
        data: docs
      });
    })
      .catch((err) => {
        res.status(500).json({
          status: false,
          message: "Server error. Please try again",
          error: err
        });
      });
  }
  else {
    //b
    //   console.log(req.files)
    //   if(Object.keys(req.files).length === 0 )
    //   {
    //     console.log("ok")
    //   }
    //   else
    //   {
    //     console.log("notok")
    //   }
    //   return false;
    let updateObj = {
      name: req.body.name,
      account: req.body.account,
      iifsc: req.body.iifsc,
      bank: req.body.bank
    }
    Kyc.findOneAndUpdate(
      { seller_id: { $in: [mongoose.Types.ObjectId(req.body.seller_id)] } },
      updateObj,
      // req.body,
      async (err, docs) => {
        if (err) {
          res.status(500).json({
            status: false,
            message: "Server error. Please try again.",
            error: err
          });
        }
        else {
          res.status(200).json({
            status: true,
            message: "Kyc updated successfully!",
            data: await docs
          });
        }
      }
    )
  }
  //   })
  //   .catch((err)=>{
  //       res.status(500).json({
  //           status: false,
  //           message: "Server error. Please provide images"
  //       });
  //   });
}


const getKyc = async (req, res) => {

  let shopData = await Kyc.find({ seller_id: { $in: [mongoose.Types.ObjectId(req.params.id)] } }).exec();

  res.status(200).json({
    status: true,
    message: "Kyc updated successfully!",
    data: shopData
  });

}

const getGraphcomission = async (req, res) => {

  var today = new Date();
  var dd = today.getDate();

  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  }

  if (mm < 10) {
    mm = '0' + mm;
  }
  today = dd + '/' + mm + '/' + yyyy;

  var prev_date = new Date();
  prev_date.setDate(prev_date.getDate() - 1);
  var ddy = prev_date.getDate();
  var mmy = prev_date.getMonth() + 1;
  var yyyyy = prev_date.getFullYear();
  if (ddy < 10) {
    ddy = '0' + ddy;
  }

  if (mmy < 10) {
    mmy = '0' + mmy;
  }
  prev_date = ddy + '/' + mmy + '/' + yyyyy;
  // console.log(prev_date)

  var prev_datesev = new Date();
  prev_datesev.setDate(prev_datesev.getDate() - 7);
  var ddsev = prev_datesev.getDate();
  var mmsev = prev_datesev.getMonth() + 1;
  var yyyysev = prev_datesev.getFullYear();
  if (ddsev < 10) {
    ddsev = '0' + ddsev;
  }

  if (mmsev < 10) {
    mmsev = '0' + mmsev;
  }
  prev_datesev = ddsev + '/' + mmsev + '/' + yyyysev;
  // console.log(prev_datesev)

  var d = new Date();
  console.log(d.toLocaleDateString());
  d.setMonth(d.getMonth() - 1);
  console.log(d.toLocaleDateString());

  var dy = new Date();
  console.log(dy.toLocaleDateString());
  dy.setMonth(dy.getMonth() - 12);
  console.log(dy.toLocaleDateString());

  let servicecommission = await Servicecommission.find({ seller_id: { $in: [mongoose.Types.ObjectId(req.body.id)] } }).exec();
  var newdata = servicecommission
  var newD = [];
  var todaysTotal = 0;
  var yestardayTotal = 0;
  var sevendaysTotal = 0;
  var monthTotal = 0;
  var yearTotal = 0;



  newdata.map((item, index) => {
    let changeDate = moment(item.created_on).format('DD/MM/YYYY');
    if (changeDate == today) {
      todaysTotal = parseInt(todaysTotal) + parseInt(item.seller_commission)
    }
    if (changeDate == prev_date) {
      yestardayTotal = parseInt(yestardayTotal) + parseInt(item.seller_commission)
    }
    if (changeDate >= prev_datesev && changeDate <= today) {
      console.log(item._id)
      sevendaysTotal = parseInt(sevendaysTotal) + parseInt(item.seller_commission)
    }
    if (changeDate >= d.toLocaleDateString() && changeDate <= today) {
      console.log(item._id)
      monthTotal = parseInt(monthTotal) + parseInt(item.seller_commission)
    }
    if (changeDate >= dy.toLocaleDateString() && changeDate <= today) {
      console.log(item._id)
      yearTotal = parseInt(yearTotal) + parseInt(item.seller_commission)
    }

  })




  res.status(200).json({
    status: true,
    todaysTotal: todaysTotal,
    yestardayTotal: yestardayTotal,
    sevendaysTotal: sevendaysTotal,
    monthTotal: monthTotal,
    yearTotal: yearTotal,



  });

}

var applyForSeller = async (req, res) => {
  var adminCheck = await SELLER.findOne({ seller_id: mongoose.Types.ObjectId(req.body.seller_id) }).exec();
  console.log(adminCheck);

  if (adminCheck == null || adminCheck == "") {
    const V = new Validator(req.body, {
      name: 'required',
      address: 'required',
      email: 'required',
      phone: 'required',
      govt_id_name: 'required',
      govt_id: 'required'
    });
    let matched = await V.check().then(val => val);

    if (!matched) {
      return res.status(400).json({ status: false, errors: V.errors });
    }

    if (req.file == "" || req.file == null || typeof req.file == "undefined") {
      return res.status(400).send({
        status: false,
        error: {
          "image": {
            "message": "The image field is mandatory.",
            "rule": "required"
          }
        }
      });
    }

    var image_url = await Upload.uploadFile(req, "sellers");

    if (req.body.image != "" || req.body.image != null || typeof req.body.image != "undefined") {
      req.body.image = image_url;
    }
    if (req.body.seller_id != "" || req.body.seller_id != null || typeof req.body.seller_id != "undefined") {
      req.body.seller_id = mongoose.Types.ObjectId(req.body.seller_id);
    }

    const NEW_SELLER = new SELLER(req.body);

    return NEW_SELLER.save()
      .then(data => {
        res.status(200).json({
          status: true,
          message: "Data saved successfully.",
          data: data
        });
      })
      .catch(err => {
        res.status(500).json({
          status: false,
          message: "Failed to save data. Server error.",
          error: err.message
        });
      });
  }
  else {
    return res.status(500).json({
      status: false,
      data: null,
      error: "Seller approval request already sent."
    });
  }
}

var getSellerApprovalStatus = async (req, res) => {
  var id = req.params.id;

  return SELLER.findOne(
    { _id: mongoose.Types.ObjectId(id) }
  )
    .then(data => {
      res.status(200).json({
        status: true,
        message: "Data successfully edited.",
        data: data
      });
    })
    .catch(err => {
      res.status(500).json({
        status: false,
        message: "Invalid id. Server error.",
        error: err
      });
    });
}

module.exports = {
  viewUser,
  viewUserList,
  viewSellerList,
  sellercomHistory,
  totalandpendingcomission,
  applyWithdraw,
  withdrawHistory,
  kyccreateNUpdate,
  getKyc,
  getGraphcomission,
  applyForSeller,
  getSellerApprovalStatus
}