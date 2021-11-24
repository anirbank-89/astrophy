const mongoose = require("mongoose");
const ServiceCart = require("../../Models/servicecart");
//var Coupon = require("../../Models/coupon");
const ServiceCheckout = require("../../Models/servicecheckout");
const Servicecommission = require("../../Models/servicecommission");
var SubscribedBy = require("../../Models/subscr_purchase");
var Totalcomission = require("../../Models/totalcomission");


const { Validator } = require("node-input-validator");

const create = async (req, res) => {
  const v = new Validator(req.body, {
    user_id: "required",
    seller_id:"required",
    subtotal: "required",
    //discount_percent: "required",
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
    seller_id: mongoose.Types.ObjectId(req.body.seller_id),
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

  let subDataf = await SubscribedBy.findOne({userid:mongoose.Types.ObjectId(req.body.seller_id),status:true}).exec();
  
  let sellerCom = 0;

  let comType = subDataf.comission_type

  let comValue = subDataf.seller_comission



  if(subDataf.comission_type=="Flat comission")
  {
    sellerCom = subDataf.seller_comission
  }
  else
  {
    sellerCom = (req.body.total * subDataf.seller_comission )/100;
  }

  // console.log(sellerCom);
  // return false;
  
  //  if (
  //   req.body.coupon_id != "" &&
  //   req.body.coupon_id != null &&
  //   typeof req.body.coupon_id != undefined
  // ) {
  //   dataSubmit.coupon_id = mongoose.Types.ObjectId(req.body.coupon_id);
  // }
  // if (
  //   req.body.coupon != "" &&
  //   req.body.coupon != null &&
  //   typeof req.body.coupon != undefined
  // ) {
  //   dataSubmit.coupon = req.body.coupon;
  // }
  if (
    req.body.address2 != "" &&
    req.body.address2 != null &&
    typeof req.body.address2 != undefined
  ) {
    dataSubmit.address2 = req.body.address2;
  }
  console.log(dataSubmit);
  //   return false;
  /*if (
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
*/ 
    if(req.body.tokenid!='' && typeof req.body.tokenid!=undefined)
    {
      dataSubmit.tokenid = req.body.tokenid
    }
  const saveData = new ServiceCheckout(dataSubmit);
  return saveData
    .save()
    .then((data) => {
      ServiceCart.updateMany(
        { user_id: mongoose.Types.ObjectId(req.body.user_id), status: true },
        { $set: { status: false, order_id: data.order_id } },
        { multi: true },
        (err, writeResult) => {
          // console.log(err);
        }
      );

      let dataComision = {
        _id: mongoose.Types.ObjectId(),
        order_id: mongoose.Types.ObjectId(data._id),
        seller_id: mongoose.Types.ObjectId(req.body.seller_id),
        commision_type: comType,        
        commision_value: comValue,
        price: req.body.total,
        seller_commission: sellerCom        
      };

  //     console.log(dataComision);
  // return false;
      const saveCom = new Servicecommission(dataComision);
      saveCom.save()

      let Totalcomission = Totalcomission.findOne({seller_id:mongoose.Types.ObjectId(req.body.seller_id)}).exec();
      if(Totalcomission.length>0)
      {
        let totalComcal = parseFloat(Totalcomission.comission_total) + parseFloat(sellerCom)
        Totalcomission.findOneAndUpdate(
          { seller_id: mongoose.Types.ObjectId(req.body.seller_id)},
          { $set: { comission_total: totalComcal,comission_all:totalComcal} },
          (err, writeResult) => {
            // console.log(err);
          }
        );
      }
      else
      {
        let dataComisionTotal = {
          _id: mongoose.Types.ObjectId(),
          seller_id: mongoose.Types.ObjectId(req.body.seller_id),
          comission_total: totalComcal,        
          comission_all: totalComcal     
        };
  
    //     console.log(dataComision);
    // return false;
        const saveComTotal = new Totalcomission(dataComisionTotal);
        saveComTotal.save()
      }

      res.status(200).json({
        status: true,
        message: "Service Order Placed Successfully",
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

/*const checkCoupon = async (req, res) => {
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
};*/

module.exports = {
  create
  //checkCoupon,
};
