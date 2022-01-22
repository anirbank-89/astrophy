const mongoose = require("mongoose");
const ServiceCart = require("../../Models/servicecart");
//var Coupon = require("../../Models/coupon");
const ServiceCheckout = require("../../Models/servicecheckout");
const Servicecommission = require("../../Models/servicecommission");
const SubscribedBy = require("../../Models/subscr_purchase");
const Totalcomission = require("../../Models/totalcomission");
const Withdraw = require('../../Models/withdraw');
const ServiceRefund = require('../../Models/service_refund');

const { Validator } = require("node-input-validator");

const create = async (req, res) => {
  const v = new Validator(req.body, {
    user_id: "required",
    seller_id: "required",
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

  let subDataf = await SubscribedBy.findOne({ userid: mongoose.Types.ObjectId(req.body.seller_id), status: true }).exec();

  // let sellerCom = 0;

  // let comType = subDataf.comission_type

  // let comValue = subDataf.seller_comission



  // if(subDataf.comission_type=="Flat comission")
  // {
  //   sellerCom = subDataf.seller_comission
  // }
  // else
  // {
  //   sellerCom = (req.body.total * subDataf.seller_comission )/100;
  // }

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
  //   if (
  //   req.body.tip != "" &&
  //   req.body.tip != null &&
  //   typeof req.body.tip != undefined
  // ) {
  //   dataSubmit.tip = mongoose.Types.ObjectId(req.body.tip);
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
  // let totalcomission = await Totalcomission.findOne({seller_id:mongoose.Types.ObjectId(req.body.seller_id)}).exec();
  if (req.body.tokenid != '' && typeof req.body.tokenid != undefined) {
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

      // let dataComision = {
      //   _id: mongoose.Types.ObjectId(),
      //   order_id: mongoose.Types.ObjectId(data._id),
      //   seller_id: mongoose.Types.ObjectId(req.body.seller_id),
      //   commision_type: comType,        
      //   commision_value: comValue,
      //   price: req.body.total,
      //   seller_commission: sellerCom        
      // };

      //     console.log(dataComision);
      // return false;
      // const saveCom = new Servicecommission(dataComision);
      // saveCom.save()


      // console.log(totalcomission)

      // if(totalcomission!=null)
      // {
      //   console.log('a')


      //   let totalComcal = parseFloat(totalcomission.comission_total) + parseFloat(sellerCom)
      //   Totalcomission.findOneAndUpdate(
      //     { seller_id: mongoose.Types.ObjectId(req.body.seller_id)},
      //     { $set: { comission_total: totalComcal,comission_all:totalComcal} },
      //     (err, writeResult) => {
      //       // console.log(err);
      //     }
      //   );
      // }
      // else
      // {
      //   console.log('b')
      //   let dataComisionTotalval = {
      //     _id: mongoose.Types.ObjectId(),
      //     seller_id: mongoose.Types.ObjectId(req.body.seller_id),
      //     comission_total: sellerCom,        
      //     comission_all: sellerCom     
      //   };
      //   console.log(dataComisionTotalval)
      //   const saveComTotal = new Totalcomission(dataComisionTotalval);
      //   saveComTotal.save()
      // }

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

const setStatus = async (req, res) => {
  var id = req.body.id;
  var acceptstatus = req.body.acceptstatus;

  var current_status = await ServiceCheckout.findById({ _id: id }).exec();

  console.log("Shop Service data", current_status);

  if (current_status.acceptstatus === "pending") {
    console.log(true);
    if (acceptstatus == 'accept') {
      return ServiceCheckout.findByIdAndUpdate(
        { _id: id },
        { $set: { acceptstatus: acceptstatus } },
        // { new: true },
        (err, docs) => {
          docs = { ...docs._doc, ...req.body };
          if (!err) {
            res.status(200).json({
              status: true,
              message: "Service request has been accepted.",
              data: docs
            });
          }
          else {
            res.status(500).json({
              status: false,
              message: "Invalid id. Server error.",
              error: err
            });
          }
        }
      );
    }
    else {
      return ServiceCheckout.findByIdAndUpdate(
        { _id: id },
        { $set: { acceptstatus: acceptstatus } },
        // { new: true },
        (err, docs) => {
          docs = { ...docs._doc, ...req.body };
          if (!err) {
            res.status(200).json({
              status: true,
              message: "Service request has been rejected.",
              data: docs
            });
          }
          else {
            res.status(500).json({
              status: false,
              message: "Invalid id. Server error.",
              error: err
            });
          }
        }
      );
    }
  }
  else {
    return res.status(500).json({
      status: false,
      error: "Seller action for this service is set.",
      data: null
    });
  }
}

var completeServiceRequest = async (req, res) => {
  var id = req.params.id;

  return ServiceCheckout.findOneAndUpdate(
    { _id: mongoose.Types.ObjectId(id) },
    { $set: { completestatus: true } },
    { new: true }
  )
    .then(async (docs) => {
      let subDataf = await SubscribedBy.findOne({ userid: mongoose.Types.ObjectId(docs.seller_id), status: true }).exec();

      let sellerCom = 0;

      let comType = subDataf.comission_type

      let comValue = subDataf.seller_comission



      if (subDataf.comission_type == "Flat comission") {
        sellerCom = subDataf.seller_comission
      }
      else {
        sellerCom = (docs.total * subDataf.seller_comission) / 100;
      }

      let totalcomission = await Totalcomission.findOne({ seller_id: mongoose.Types.ObjectId(docs.seller_id) }).exec();
      let dataComision = {
        _id: mongoose.Types.ObjectId(),
        order_id: mongoose.Types.ObjectId(docs._id),
        seller_id: mongoose.Types.ObjectId(docs.seller_id),
        commision_type: comType,
        commision_value: comValue,
        price: docs.total,
        seller_commission: sellerCom
      };

      //     console.log(dataComision);
      // return false;
      const saveCom = new Servicecommission(dataComision);
      saveCom.save()


      console.log(totalcomission)

      if (totalcomission != null) {
        console.log('a')


        let totalComcal = parseFloat(totalcomission.comission_total) + parseFloat(sellerCom)
        Totalcomission.findOneAndUpdate(
          { seller_id: mongoose.Types.ObjectId(docs.seller_id) },
          { $set: { comission_total: totalComcal, comission_all: totalComcal } },
          (err, writeResult) => {
            // console.log(err);
          }
        );
      }
      else {
        console.log('b')
        let dataComisionTotalval = {
          _id: mongoose.Types.ObjectId(),
          seller_id: mongoose.Types.ObjectId(docs.seller_id),
          comission_total: sellerCom,
          comission_all: sellerCom
        };
        console.log(dataComisionTotalval)
        const saveComTotal = new Totalcomission(dataComisionTotalval);
        saveComTotal.save()
      }

      res.status(200).json({
        status: true,
        message: "Buyer service request has been completed.",
        data: docs
      });
    })
    .catch(err => {
      res.status(500).json({
        status: false,
        message: "Invalid id. Server error.",
        error: err.message
      });
    });
}

const setTips = async (req, res) => {
  var id = req.body.id;

  console.log(true);
  return ServiceCheckout.findByIdAndUpdate(
    { _id: id },
    { $set: { tip: req.body.tip } },
    // { new: true },
    (err, docs) => {
      docs = { ...docs._doc, ...req.body };
      if (!err) {
        res.status(200).json({
          status: true,
          message: "Tip paid successfully",
          data: docs
        });
      }
      else {
        res.status(500).json({
          status: false,
          message: "Invalid id. Server error.",
          error: err
        });
      }
    }
  );

}

const setSellersettlement = async (req, res) => {
  var id = req.params.id;

  let totalcomission = await Totalcomission.findOne({ seller_id: mongoose.Types.ObjectId(id) }).exec();
  let totalEarning = totalcomission.comission_all
  // let totalSettlement = parseInt(totalcomission.comission_all) - parseInt(totalcomission.comission_total)

  /**------------------------ Get the amount withdrawn and settled by Astrophy ------------------------ */
  let amount_credited = await Withdraw.find({ seller_id: mongoose.Types.ObjectId(id), paystatus: true }).exec();
  console.log("Amount settled", amount_credited);

  var settledAmt = 0;

  if (amount_credited.length > 0) {
    amount_credited.forEach(element => {
      settledAmt = parseInt(settledAmt) + parseInt(element.amount);
    });
  }
  else {
    // In this case, no amount has been withdrawn
    settledAmt = 0;
  }
  /**-------------------------------------------------------------------------------------------------- */

  /**---------------------- Get the amount withdrawn but bot settled by Astrophy ---------------------- */
  let amountRequested = await Withdraw.find({ seller_id: mongoose.Types.ObjectId(id), paystatus: false }).exec();
  console.log("Amount requested", amountRequested);

  var requestedAmt = 0;

  if (amountRequested.length > 0) {
    amountRequested.forEach(element => {
      requestedAmt = parseInt(requestedAmt) + parseInt(element.amount);
    });
  }
  else {
    requestedAmt = 0;
  }
  /**-------------------------------------------------------------------------------------------------- */

  /**-------------------------------- Amount earned but not claimed ----------------------------------- */
  var inWallet = parseInt(totalEarning) - (parseInt(settledAmt) + parseInt(requestedAmt));
  /**-------------------------------------------------------------------------------------------------- */

  /**-------------------------------- Refunded from seller earnings ----------------------------------- */
  let subDataf = await SubscribedBy.findOne({ userid: mongoose.Types.ObjectId(id), status: true }).exec();

  let sellerCom = 0;

  if (subDataf.comission_type == "Flat comission") {
    sellerCom = subDataf.seller_comission
  }
  else {
    sellerCom = (current_status.total * subDataf.seller_comission) / 100;
  }

  let refundedServices = await ServiceRefund.find(
    {
      request_status: "approved",
      refund_status: false
    }
  ).exec();

  var refundedAmount = sellerCom * Number(refundedServices.length);
  /**------------------------------------------------------------------------------------------------*/

  // if (refundedAmount > inWallet) {
  //   //
  // } else
  if (refundedAmount >= inWallet) {                        // it will be refundedAmount == inWallet
    var takeFromWallet = refundedAmount - inWallet;
    var newPayableRequest = requestedAmt - takeFromWallet;
    var newWalletValue = 0;

    res.status(200).json({
      status: true,
      total_earnings: totalEarning,
      earning_settled: settledAmt,
      new_refunds: refundedAmount,
      pending_settlement: newPayableRequest,
      in_wallet: newWalletValue
    });
  }
  else {
    res.status(200).json({
      status: true,
      total_earnings: totalEarning,
      earning_settled: settledAmt,
      new_refunds: refundedAmount,
      pending_settlement: requestedAmt,
      in_wallet: inWallet - refundedAmount
    });
  }
}

module.exports = {
  create,
  setStatus,
  completeServiceRequest,
  setTips,
  setSellersettlement
  //checkCoupon,
};
