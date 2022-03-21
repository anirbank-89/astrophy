const mongoose = require("mongoose");
const { Validator } = require("node-input-validator");

const ServiceCheckout = require("../../Models/servicecheckout");
const NEW_SERVICE_CHECKOUT = require("../../Models/new_service_checkout");
// const ServiceCart = require("../../Models/servicecart");
const NEW_SERVICECART = require("../../Models/new_servicecart");
const Coupon = require("../../Models/servicecoupon");
const UserAddresses = require('../../Models/user_address');
const User = require('../../Models/user');
const Servicecommission = require("../../Models/servicecommission");
const SubscribedBy = require("../../Models/subscr_purchase");
const Totalcomission = require("../../Models/totalcomission");
const Withdraw = require('../../Models/withdraw');
const ServiceRefund = require('../../Models/service_refund');
const TOTAL_SERV_COMM_REFUNDS = require("../../Models/total_servicecomission_refund");

const emailSend = require('../../service/emailsend');

const create = async (req, res) => {
  const v = new Validator(req.body, {
    user_id: "required",
    subtotal: "required",
    //discount_percent: "required",
    // total: "required",
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
    return res.status(400).json({ status: false, errors: v.errors });
  }

  let dataSubmit = {
    _id: mongoose.Types.ObjectId(),
    user_id: mongoose.Types.ObjectId(req.body.user_id),
    order_id: Number(
      `${new Date().getDate()}${new Date().getMonth()}${new Date().getFullYear()}${new Date().getHours()}${new Date().getSeconds()}${new Date().getMilliseconds()}`
    ),
    subtotal: req.body.subtotal,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    address1: req.body.address1,
    country: req.body.country,
    state: req.body.state,
    zip: req.body.zip,
    paymenttype: req.body.paymenttype,
  }
  if (req.body.discount_percent != "" || req.body.discount_percent != null || typeof req.body.discount_percent != undefined) {
    dataSubmit.discount_percent = req.body.discount_percent;
  }
  if (req.body.coupon != "" && req.body.coupon != null && typeof req.body.coupon != undefined) {
    dataSubmit.coupon = req.body.coupon;
  }
  if (req.body.total != "" || req.body.total != null || typeof req.body.total != undefined) {
    dataSubmit.total = req.body.total;
  }
  if (req.body.address2 != "" || req.body.address2 != null || typeof req.body.address2 != undefined) {
    dataSubmit.address2 = req.body.address2;
  }
  if (req.body.tokenid != "" || req.body.tokenid != null || typeof req.body.tokenid != undefined) {
    dataSubmit.tokenid = req.body.tokenid
  }
  if (req.body.shipping_address != "" || req.body.shipping_address != null || typeof req.body.shipping_address != "undefined") {
    dataSubmit.shipping_address = req.body.shipping_address;
  }
  if (req.body.address_future_use != "" || req.body.address_future_use != null || typeof req.body.address_future_use != "undefined") {
    dataSubmit.address_future_use = req.body.address_future_use;
  }

  const saveData = new NEW_SERVICE_CHECKOUT(dataSubmit);
  return saveData.save()
    .then(async (data) => {
      console.log("Checkout data ", data);
      // Update the cart items with order id
      let cartUpdate = await NEW_SERVICECART.updateMany(
        { user_id: data.user_id, status: true },
        {
          $set:
          {
            status: false,
            order_id: data.order_id,
            discount_percent: data.discount_percent,
            booking_date: data.booking_date
          }
        },
        { multi: true },
        (err, writeResult) => {
          if (err) {
            console.log(err.message);
          }
        }
      );

      // Decrease the number of the coupon applied on checkout
      if (data.coupon != null) {
        let coupData = await Coupon.findOne({
          name: data.coupon.name,
          status: true
        }).exec();

        coupData.times -= 1;
        coupData.save();
      }

      // Save billing and/or shipping address
      if (data.address_future_use != "" || data.address_future_use != null || typeof data.address_future_use != "undefined") {
        let billingDetails = await UserAddresses.findOne({ userid: data.user_id, future_use: true }).exec();

        if (billingDetails == null) {
          let billingData = {
            _id: mongoose.Types.ObjectId(),
            userid: data.user_id,
            firstname: data.firstname,
            lastname: data.lastname,
            address1: data.address1,
            state: data.state,
            country: data.country,
            zip: data.zip,
            future_use: data.address_future_use
          }
          if (data.address2 != "" || data.address2 != null || typeof data.address2 != "undefined") {
            billingData.address2 = data.address2;
          }
          if (data.shipping_address != "" || data.shipping_address != null || typeof data.shipping_address != "undefined") {
            billingData.shipping = data.shipping_address;
          }

          const NEW_BILLING_ADDRESS = new UserAddresses(billingData);
          NEW_BILLING_ADDRESS.save();
        }
        else {
          billingDetails.delete();

          let billingData = {
            _id: mongoose.Types.ObjectId(),
            userid: data.user_id,
            firstname: data.firstname,
            lastname: data.lastname,
            address1: data.address1,
            state: data.state,
            country: data.country,
            zip: data.zip,
            future_use: data.address_future_use
          }
          if (data.address2 != "" || data.address2 != null || typeof data.address2 != "undefined") {
            billingData.address2 = data.address2;
          }
          if (data.shipping_address != "" || data.shipping_address != null || typeof data.shipping_address != "undefined") {
            billingData.shipping = data.shipping_address;
          }

          const NEW_BILLING_ADDRESS = new UserAddresses(billingData);
          NEW_BILLING_ADDRESS.save();
        }
      }
      else {
        let billingData = {
          _id: mongoose.Types.ObjectId(),
          userid: data.user_id,
          firstname: data.firstname,
          lastname: data.lastname,
          address1: data.address1,
          state: data.state,
          country: data.country,
          zip: data.zip
        }
        if (data.address2 != "" || data.address2 != null || typeof data.address2 != "undefined") {
          billingData.address2 = data.address2;
        }
        if (data.shipping_address != "" || data.shipping_address != null || typeof data.shipping_address != "undefined") {
          billingData.shipping = data.shipping_address;
        }

        const NEW_BILLING_ADDRESS = new UserAddresses(billingData);
        NEW_BILLING_ADDRESS.save();
      }

      res.status(200).json({
        status: true,
        message: "Service Order Placed Successfully.",
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        message: "Server error. Please try again.",
        error: err.message
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

  var current_status = await NEW_SERVICECART.findById({ _id: id }).exec();

  console.log("Cart data", current_status);

  if (current_status.order_id == "" || current_status.order_id == null || typeof current_status.order_id == "undefined") {
    return res.status(500).json({
      status: false,
      data: null,
      error: "Payment not yet made. Cannot accept this order."
    });
  }
  else {
    if (current_status.acceptstatus === "pending") {
      console.log(true);
      if (acceptstatus == 'accept') {
        return NEW_SERVICECART.findByIdAndUpdate(
          { _id: id },
          {
            $set: {
              acceptstatus: acceptstatus
              // completestatus: true
            }
          },
          // { new: true },
          async (err, docs) => {
            docs = { ...docs._doc, ...req.body };
            if (!err) {

              let userData = await User.findOne({ _id: docs.user_id }).exec();
              let checkoutData = await NEW_SERVICE_CHECKOUT.findOne({ order_id: docs.order_id }).exec();

              let sendMail = emailSend.buyerOrderConfirmation(checkoutData, docs, userData.email);

              // enter data in service commission earned and total commission throughout history
              let servTotalVal = 0;

              if (docs.discount_percent == 0) {
                servTotalVal = docs.price;
              }
              else {
                servTotalVal = docs.price - ((docs.price * docs.discount_percent) / 100);
              }

              let subDataf = await SubscribedBy.findOne(
                {
                  userid: docs.seller_id,
                  status: true
                }
              ).exec();

              let sellerCom = 0;

              let comType = subDataf.comission_type;

              let comValue = subDataf.seller_comission;

              if (comType == "Flat comission") {
                sellerCom = comValue;
              }
              else {
                sellerCom = (servTotalVal * comValue) / 100;
              }

              let dataComision = {
                _id: mongoose.Types.ObjectId(),
                serv_id: docs.serv_id,
                seller_id: docs.seller_id,
                cart_id: docs._id,
                order_id: docs.order_id,
                commision_type: comType,
                commision_value: comValue,
                price: servTotalVal,
                seller_commission: sellerCom
              };

              //     console.log(dataComision);
              // return false;
              const saveCom = new Servicecommission(dataComision);
              saveCom.save()

              let totalcomission = await Totalcomission.findOne({ seller_id: mongoose.Types.ObjectId(docs.seller_id) }).exec();
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
        return NEW_SERVICECART.findByIdAndUpdate(
          { _id: id },
          { $set: { acceptstatus: acceptstatus } },
          // { new: true },
          async (err, docs) => {
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
}

// Currently no need to change the collection to "NEW_SERVICECART"
var completeServiceRequest = async (req, res) => {
  var id = req.params.id;

  return ServiceCheckout.findOneAndUpdate(
    { _id: mongoose.Types.ObjectId(id) },
    { $set: { completestatus: true } },
    { new: true }
  )
    .then(async (docs) => {
      // enter data in service commission earned and total commission throughout history

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
  return NEW_SERVICECART.findByIdAndUpdate(
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
  // if-else clause
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
  let amountRequested = await Withdraw.find(
    {
      seller_id: mongoose.Types.ObjectId(id),
      paystatus: false
    }
  ).exec();
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
  let current_status = await ServiceCheckout.find(
    {
      seller_id: id,
      completestatus: false
    }
  ).exec();

  // more operations need to be done on current status
  let sellerCom = 0;

  if (subDataf.comission_type == "Flat comission") {
    sellerCom = subDataf.seller_comission
  }
  else {
    sellerCom = (current_status.total * subDataf.seller_comission) / 100;
  }

  let refundedServices = await ServiceRefund.find(
    {
      seller_id: mongoose.Types.ObjectId(id),
      request_status: "approved",
      refund_status: false
    }
  ).exec();

  var refundedAmount = sellerCom * Number(refundedServices.length);
  /**------------------------------------------------------------------------------------------------*/

  if (refundedAmount > inWallet) {
    var takeFromWallet = refundedAmount - inWallet;
    var newPayableRequest = requestedAmt - takeFromWallet;
    var newWalletValue = 0;

    let editSellerWithdraw = await Withdraw.updateMany(
      {
        seller_id: mongoose.Types.ObjectId(id),
        paystatus: false
      },
      { $set: { paystatus: true } },
      { multi: true },
      (err, writeResult) => {
        // console.log(writeResult)
      }
    );

    // let obj = {
    //   _id: mongoose.Types.ObjectId(),
    //   seller_id: mongoose.Types.ObjectId(id),
    //   amount: newPayableRequest
    // }

    // const NEW_PERMISSIBLE_WITHDRAW = new Withdraw(obj);
    // NEW_PERMISSIBLE_WITHDRAW.save();

    res.status(200).json({
      status: true,
      total_earnings: totalEarning,
      earning_settled: settledAmt,
      new_refunds: refundedAmount,
      pending_settlement: newPayableRequest,
      in_wallet: newWalletValue
    });
  }
  else if (refundedAmount == inWallet) {
    var newWalletValue = 0;

    res.status(200).json({
      status: true,
      total_earnings: totalEarning,
      earning_settled: settledAmt,
      new_refunds: refundedAmount,
      pending_settlement: requestedAmt,
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


// let serviceCheckout = await ServiceCheckout.find(
//   {
//     seller_id: mongoose.Types.ObjectId(id),
//     acceptstatus: "accept"
//   }
// ).exec();
// // console.log(serviceCheckout);
// var totalServiceValue = 0;

// serviceCheckout.forEach(element => {
//   totalServiceValue = parseInt(totalServiceValue) + parseInt(element.total);
// });
// // console.log("Total service value", totalServiceValue);

// var totalEarnings = 0;

// var comType = subDataf.comission_type;

// var comValue = subDataf.seller_comission;

// if (comType == "Flat comission") {
//   totalEarnings = comValue * Number(serviceCheckout.length);

// }
// else {
//   totalEarnings = (totalServiceValue * comValue) / 100;
// }

// console.log("Total commission earned = ", totalEarnings);

var getSellerSettlement = async (req, res) => {
  var id = req.params.id;

  /**------------------------------------Total earnings------------------------------------ */
  let totalcomission = await Totalcomission.findOne({ seller_id: mongoose.Types.ObjectId(id) }).exec();
  let totalEarnings = totalcomission.comission_all;
  /**-------------------------------------------------------------------------------------- */

  /**---------------------------------- Settled earnings ---------------------------------- */
  let settlementEarnings = await Servicecommission.find(
    {
      seller_id: mongoose.Types.ObjectId(id),
      status: true,
      sellerapply: true,
      paystatus: true
    }
  ).exec();

  var earningSettled = 0;

  settlementEarnings.forEach(element => {
    earningSettled = earningSettled + element.seller_commission;
  });
  console.log("Earning setlled = ", earningSettled);
  /**-------------------------------------------------------------------------------------- */

  /**--------------------------------- Pending settlement --------------------------------- */
  let settlementPending = await Servicecommission.find(
    {
      seller_id: mongoose.Types.ObjectId(id),
      status: false,
      refund: false,
      sellerapply: false,
      paystatus: false
    }
  ).exec();

  var pendingSettlement = 0;

  settlementPending.forEach(element => {
    pendingSettlement = parseInt(pendingSettlement) + parseInt(element.seller_commission);
  });
  console.log("Pending settlement = ", pendingSettlement);
  /**-------------------------------------------------------------------------------------- */

  /**---------------------------------- Claimable earnings -------------------------------- */
  let claimableCommissions = await Servicecommission.find(
    {
      seller_id: mongoose.Types.ObjectId(id),
      status: true,
      refund: false,
      sellerapply: false,
      paystatus: false
    }
  ).exec();
  // console.log(serviceCommission);
  var claimableEarnings = 0;

  claimableCommissions.forEach(element => {
    claimableEarnings = claimableEarnings + element.seller_commission;
  });
  console.log("Cleared earnings = ", claimableEarnings);
  /**-------------------------------------------------------------------------------------- */

  /**-------------------------------- Service refund amount ------------------------------- */
  let totalRefundsData = await TOTAL_SERV_COMM_REFUNDS.findOne({ seller_id: mongoose.Types.ObjectId(id) }).exec();

  let refundedAmount = 0;

  if (totalRefundsData == null) {
    refundedAmount = 0;
  }
  else {
    refundedAmount = totalRefundsData.total_refunded;
  }
  /**-------------------------------------------------------------------------------------- */

  res.send({
    total_earnings: totalEarnings,
    earning_settled: earningSettled,
    pending_settlement: pendingSettlement,
    service_refund_amt: refundedAmount,
    claimable_earnings: claimableEarnings
  });
}

module.exports = {
  create,
  setStatus,
  completeServiceRequest,
  setTips,
  setSellersettlement,
  //checkCoupon,
  getSellerSettlement
};
