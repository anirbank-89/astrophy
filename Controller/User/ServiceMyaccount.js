var mongoose = require('mongoose')

// var ServiceCheckout = require('../../Models/servicecheckout')
var NewServiceCheckout = require('../../Models/new_service_checkout')
var ServiceRefund = require('../../Models/service_refund')
// var ServiceCart = require('../../Models/servicecart')
var NewServiceCart = require('../../Models/new_servicecart')
var userAddress = require('../../Models/user_address')

var invoiceGenerator = require('../../service/invoiceGenerator')

const viewAll = async (req, res) => {
  return NewServiceCheckout.aggregate(
    [
      {
        $match: {
          user_id: mongoose.Types.ObjectId(req.params.user_id),

        },
      },
      {
        $lookup: {
          from: "new_servicecarts",
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

  var checkStatus = await NewServiceCart.findOne({ _id: mongoose.Types.ObjectId(id) }).exec();

  if (checkStatus.order_id == null || checkStatus.order_id == "" || typeof checkStatus.order_id == "undefined") {
    return res.status(500).json({
      status: false,
      message: "Invalid id. Payment not made for this order.",
      data: null
    });
  }
  else {
    if (checkStatus.acceptstatus == "accept") {
      return NewServiceCart.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: { refund_request: 'yes' } },
        { new: true }
      )
        .then(async (docs) => {
          console.log("Cart data ", docs);
          var refAmt = 0;   // this will go to 'refund_amount'
          if (docs.discount_percent == null || docs.discount_percent == "" || typeof docs.discount_percent == "undefined") {
            refAmt = parseInt(docs.price);
          }
          else {
            refAmt = parseInt(docs.price) - ((parseInt(docs.price) * parseInt(docs.discount_percent)) / 100);
          }

          let checkoutData = await NewServiceCheckout.findOne({ order_id: docs.order_id }).exec();
          console.log("Checkout data ", checkoutData);

          let refundData = {
            user_id: docs.user_id,
            seller_id: docs.seller_id,
            serv_id: docs.serv_id,
            cart_id: docs._id,
            order_id: docs.order_id,
            refund_amount: refAmt,
            firstname: checkoutData.firstname,
            lastname: checkoutData.lastname,
            address1: checkoutData.address1,
            country: checkoutData.country,
            state: checkoutData.state,
            zip: checkoutData.zip,
            paymenttype: checkoutData.paymenttype
          }
          if (checkoutData.address2 != null || checkoutData.address2 != "" || typeof checkoutData.address2 != "undefined") {
            refundData.address2 = checkoutData.address2;
          }
          if (checkoutData.cardname != null || checkoutData.cardname != "" || typeof checkoutData.cardname != "undefined") {
            refundData.cardname = checkoutData.cardname;
          }
          if (checkoutData.cardno != null || checkoutData.cardno != "" || typeof checkoutData.cardno != "undefined") {
            refundData.cardno = checkoutData.cardno;
          }
          if (checkoutData.expdate != null || checkoutData.expdate != "" || typeof checkoutData.expdate != "undefined") {
            refundData.expdate = checkoutData.expdate;
          }
          if (checkoutData.cvv != null || checkoutData.cvv != "" || typeof checkoutData.cvv != "undefined") {
            refundData.cvv = checkoutData.cvv;
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
}

var buyHistFromSeller = async (req, res) => {
  let boughtServices = await NewServiceCart.aggregate([
    {
      $match: {
        user_id: mongoose.Types.ObjectId(req.body.user_id),
        seller_id: mongoose.Types.ObjectId(req.body.seller_id),
      }
    },
    {
      $lookup: {
        from: "shop_services",
        localField: "serv_id",
        foreignField: "_id",
        as: "service_data"
      }
    },
    {
      $unwind: "$service_data"
    },
    {
      $project: {
        __v: 0
      }
    }
  ]).exec();

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

var downloadReceipt = async (req, res) => {
  var id = req.params.id;

  let servCheckout = await NewServiceCheckout.findOne({ _id: mongoose.Types.ObjectId(id) }).exec()
  let savedAddr = await userAddress.findOne(
    {
      userid: servCheckout.user_id,
      shipping: true
    }
  ).exec()
  let servCart = await NewServiceCart.aggregate([
    {
      $match: {
        order_id: servCheckout.order_id
      }
    },
    {
      $lookup: {
        from: "shop_services",
        localField: "serv_id",
        foreignField: "_id",
        as: "service_data"
      }
    },
    {
      $unwind: "$service_data"
    }
  ]).exec()

  var itemArr = []
  servCart.forEach(element => {
    itemArr.push(
      {
        name: element.servicename,
        price: element.price + " " + element.service_data.currency,
        quantity: 1,
      }
    )
  })
  console.log("Cart items ", itemArr);

  // Create invoice structure
  const invoiceData = {
    addresses: {
      shipping: {
        name: savedAddr.firstname + savedAddr.lastname,
        address: savedAddr.address1,
        // city: savedAddr.city,
        state: savedAddr.state,
        country: savedAddr.country,
        postalCode: savedAddr.zip
      },
      billing: {
        name: servCheckout.firstname + servCheckout.lastname,
        address: servCheckout.address1,
        // city: servCheckout.city,
        state: servCheckout.state,
        country: servCheckout.country,
        postalCode: servCheckout.zip
      }
    },
    memo: 'As discussed',
    order_id: servCheckout.order_id,
    items: itemArr,
    subtotal: servCheckout.subtotal,
    paid: servCheckout.total,
    currency: servCart[0].service_data.currency,
    invoiceNumber: `${new Date().getDate()}${new Date().getMonth()}${new Date().getHours()}${new Date().getSeconds()}${new Date().getMilliseconds()}`,
    // dueDate: servCheckout.due_date
  }

  // Generate the invoice
  const IG = new invoiceGenerator(invoiceData);
  IG.generate()

  res.send({
    status: true,
    message: "Receipt downloaded successfully.",
    data: null
  })
}

module.exports = {
  viewAll,
  refundService,
  buyHistFromSeller,
  downloadReceipt
}