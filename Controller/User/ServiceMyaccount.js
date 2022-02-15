var mongoose = require('mongoose')

var ServiceCheckout = require('../../Models/servicecheckout')
var ServiceRefund = require('../../Models/service_refund')

const viewAll = async (req, res) => {
  return ServiceCheckout.aggregate(
    [
      {
        $match: {
          user_id: mongoose.Types.ObjectId(req.params.user_id),

        },
      },
      {
        $lookup: {
          from: "servicecarts",
          localField: "order_id",
          foreignField: "order_id",
          as: "servicecart_data"
        }
      },
      {
        $lookup: {
          from: "service_refunds",
          localField: "order_id",
          foreignField: "order_id",
          as: "servicerefund_data"
        }
      },
      // {
      //     $unwind: "$servicerefund_data"
      // },
      {
        $sort: {
          _id: -1
        }
      },
      {
        $project: {
          _v: 0
        }
      }
    ]
  )
    .then((docs) => {
      res.status(200).json({
        status: true,
        message: "Order History get successfully",
        data: docs
      })
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        message: "Server error. Please try again.",
        error: err
      })
    })
}

const refundService = async (req, res) => {
  var id = req.params.id;

  var checkStatus = await ServiceCheckout.findOne({ _id: mongoose.Types.ObjectId(id) }).exec();

  if ((checkStatus.acceptstatus == "accept" && checkStatus.completestatus == false) ||
    (checkStatus.acceptstatus == "accept" && checkStatus.completestatus == true)) {
    return ServiceCheckout.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(id) },
      { status: 'cancel' },
      { new: true }
    )
      .then(async (docs) => {
        console.log("Checkout data ", docs);

        let refundData = {
          user_id: mongoose.Types.ObjectId(docs.user_id),
          seller_id: mongoose.Types.ObjectId(docs.seller_id),
          order_id: docs.order_id,
          refund_amount: docs.total,
          firstname: docs.firstname,
          lastname: docs.lastname,
          address1: docs.address1,
          country: docs.country,
          state: docs.state,
          zip: docs.zip,
          paymenttype: docs.paymenttype
        }
        if (docs.address2 != null || docs.address2 != "" || typeof docs.address2 != "undefined") {
          refundData.address2 = docs.address2;
        }
        if (docs.cardname != null || docs.cardname != "" || typeof docs.cardname != "undefined") {
          refundData.cardname = docs.cardname;
        }
        if (docs.cardno != null || docs.cardno != "" || typeof docs.cardno != "undefined") {
          refundData.cardno = docs.cardno;
        }
        if (docs.expdate != null || docs.expdate != "" || typeof docs.expdate != "undefined") {
          refundData.expdate = docs.expdate;
        }
        if (docs.cvv != null || docs.cvv != "" || typeof docs.cvv != "undefined") {
          refundData.cvv = docs.cvv;
        }
        if (docs.tip != null || docs.tip != "" || typeof docs.tip != "undefined") {
          refundData.tip = docs.tip;
        }

        const NEW_REFUND_REQUEST = new ServiceRefund(refundData);

        let saveRequest = await NEW_REFUND_REQUEST.save();

        res.status(200).json({
          status: true,
          message: "Order cancel successful. Refund process will be initiated.",
          data: docs
        });
      })
      .catch(err => {
        res.status(500).json({
          status: false,
          message: "Invalid id. Server error.",
          error: err.message
        })
      });
  }
  else {
    return res.status(500).json({
      status: false,
      error: "Service request has been rejected. Money already refunded for online payments.",
      data: null
    });
  }
}

var buyHistFromSeller = async (req, res) => {
  let boughtServices = await ServiceCheckout.find(
    {
      user_id: mongoose.Types.ObjectId(req.body.user_id),
      seller_id: mongoose.Types.ObjectId(req.body.seller_id),
      status: "true"
    }
  ).exec();

  if (boughtServices.length > 0) {
    return res.status(200).json({
      status: true,
      message: "Data successfully get.",
      no_of_buys: boughtServices.length,
      purchase_data: boughtServices
    });
  }
  else {
    return res.status(200).json({
      status: true,
      message: "No previous buys from this seller.",
      no_of_buys: 0,
      purchase_data: []
    });
  }
}

module.exports = {
  viewAll,
  refundService,
  buyHistFromSeller
}