var mongoose = require('mongoose')

var NewServiceCheckout = require('../../Models/new_service_checkout')
var ServiceRefund = require('../../Models/service_refund')
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
        error: "Can't make refund. Service request not accepted.",
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
        price_num: element.price,
        price: element.service_data.currency + " " + element.price,
        quantity: 1,
      }
    )
  })
  console.log("Cart items ", itemArr);

  // Create invoice structure
  const invoiceData = {
    addresses: {
      shipping: {
        name: savedAddr.firstname + " " + savedAddr.lastname,
        address: savedAddr.address1,
        // city: savedAddr.city,
        state: savedAddr.state,
        country: savedAddr.country,
        postalCode: savedAddr.zip
      },
      billing: {
        name: servCheckout.firstname + " " + servCheckout.lastname,
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

  const IG = new invoiceGenerator(invoiceData, res)
  var fileName = IG.generate()

  // return res.writeHead(200, {
  //   'Content-Type': 'application/pdf',
  // })

  if (savedAddr == null) {
    return res.status(500).json({
      status: false,
      error: "No shipping address. Could not generate invoice.",
      file: null
    });
  }
  else {
    return res.status(200).json({
      status: true,
      message: "Generated invoice.",
      file: fileName
    })
  }
}

// const DOC = new PDFDocument()

// DOC.pipe(res)

// // Generate the document header
// DOC
//   // .image('', 0, 0, { width: 250 })
//   .fillColor('#000')
//   .fontSize(20)
//   .text('INVOICE', 275, 50, { align: 'right' })
//   .fontSize(10)
//   .text(`Invoice Number: ${invoiceData.invoiceNumber}`, { align: 'right' })
//   // .text(`Due: ${this.invoice.dueDate}`, { align: 'right' })
//   .moveDown()
//   .text(`Billing Address:\n ${invoiceData.addresses.billing.name}\n${invoiceData.addresses.billing.address}\n${invoiceData.addresses.billing.state},${invoiceData.addresses.billing.country}, ${invoiceData.addresses.billing.postalCode}`, { align: 'right' })

// const beginningOfPage = 50
// const endOfPage = 550

// DOC.moveTo(beginningOfPage, 200)
//   .lineTo(endOfPage, 200)
//   .stroke()

// DOC.text(`Memo: ${invoiceData.memo || 'N/A'}`, 50, 210)

// DOC.moveTo(beginningOfPage, 250)
//   .lineTo(endOfPage, 250)
//   .stroke()

// // Generate the document table
// const tableTop = 270
// const tableBottom = 400
// // const itemCodeX = 50
// const nameX = 100
// const quantityX = 250
// const priceX = 300
// // const amountX = 350
// const totalX = 250
// const discountX = 300

// DOC
//   .fontSize(10)
//   // .text('Item Code', itemCodeX, tableTop, { bold: true })
//   .text('Name', nameX, tableTop)
//   .text('Quantity', quantityX, tableTop)
//   .text('Price', priceX, tableTop)
//   .text('Total', totalX, tableBottom)
//   // .text('Amount', amountX, tableTop)
//   .text('Discount amt', discountX, tableBottom)

// const cart_items = invoiceData.items
// let i = 0
// // let totalPrice = 0
// const y = tableBottom + 25

// for (i = 0; i < cart_items.length; i++) {
//   const arrEle = cart_items[i]
//   // totalPrice += items[i].price_num
//   const x = tableTop + 25 + (i * 25)

//   DOC
//     .fontSize(10)
//     // .text(item.itemCode, itemCodeX, x)
//     .text(arrEle.name, nameX, x)
//     .text(arrEle.quantity, quantityX, x)
//     .text(`${arrEle.price}`, priceX, x)
//   // .text(`$ ${item.amount}`, amountX, y)
// }
// // console.log(totalPrice);

// DOC
//   .text(`${invoiceData.currency} ${invoiceData.subtotal}`, totalX, y)
//   .text(`${invoiceData.currency} ${invoiceData.subtotal - invoiceData.paid}`, discountX, y)

// // Generate the document table footer
// DOC
//   .fontSize(10)
//   .text(`Payment received online. `, 50, 700, {
//     align: 'center'
//   })

// /** GENERATE THE DOCUMENT */
// const file_name = `uploads/orderInvoices/Invoice ${invoiceData.invoiceNumber}.pdf`;

// DOC.pipe(fs.createWriteStream(file_name));

// DOC.moveDown()
// // write out file
// DOC.end()

module.exports = {
  viewAll,
  refundService,
  buyHistFromSeller,
  downloadReceipt
}