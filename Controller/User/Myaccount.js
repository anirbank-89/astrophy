var mongoose = require('mongoose')
var passwordHash = require('password-hash')
const { Validator } = require('node-input-validator')

var Checkout = require('../../Models/checkout')
var User = require('../../Models/user')
var ProductRefund = require('../../Models/product_refund')
var userAddress = require('../../Models/user_address')
var Cart = require('../../Models/cart')

var Upload = require('../../service/upload')
var invoiceGenerator = require('../../service/invoiceGenerator')

const viewAll = async (req, res) => {
  return Checkout.aggregate(
    [
      {
        $match: {
          user_id: mongoose.Types.ObjectId(req.params.user_id),
        },
      },
      {
        $lookup: {
          from: "carts",//
          localField: "order_id",//
          foreignField: "order_id",
          as: "cart_data"//
        }
      },
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

const refundProduct = async (req, res) => {
  return Checkout.findOneAndUpdate(        // refund will be from product 'cart'
    { _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } },
    { status: 'cancel' },
    { new: true },
    async (err, data) => {
      if (err) {
        res.status(500).json({
          status: false,
          message: "Server error. Please try again.",
          error: err,
        });
      } else if (data != null) {
        // data = { ...req.body, ...data._doc };
        console.log("Checkout data", data);

        let refundData = {
          user_id: data.user_id,
          // prod_id: data.prod_id,
          order_id: data.order_id,
          refund_amount: data.total,
          firstname: data.firstname,
          lastname: data.lastname,
          address1: data.address1,
          country: data.country,
          state: data.state,
          zip: data.zip,
          paymenttype: data.paymenttype
        }
        if (data.address2 != null || data.address2 != "" || typeof data.address2 != "undefined") {
          refundData.address2 = data.address2
        }
        if (data.cardname != null || data.cardname != "" || typeof data.cardname != "undefined") {
          refundData.cardname = data.cardname
        }
        if (data.cardno != null || data.cardno != "" || typeof data.cardno != "undefined") {
          refundData.cardno = data.cardno
        }
        if (data.expdate != null || data.expdate != "" || typeof data.expdate != "undefined") {
          refundData.expdate = data.expdate
        }
        if (data.cvv != null || data.cvv != "" || typeof data.cvv != "undefined") {
          refundData.cvv = data.cvv
        }

        const NEW_REFUND_REQUEST = new ProductRefund(refundData);

        var saveRefundRequest = await NEW_REFUND_REQUEST.save();

        res.status(200).json({
          status: true,
          message: "Order Cancel successful. Refund process will be initiated",
          data: data,
        });
      } else {
        res.status(500).json({
          status: false,
          message: "Server Error",
          data: null,
        });
      }
    }
  );
}

const updateProfile = async (req, res) => {
  const V = new Validator(req.body, {
    // email, password should be made unable for edit in frontend
    email: 'required|email',
    password: 'required',// |minLength:8
    firstName: 'required',
    lastName: 'required',
    country: 'required',
    currency: 'required'
  });
  let matched = V.check().then(val => val);
  if (!matched) {
    return res.status(400).json({ status: false, errors: V.errors });
  }

  let editData = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    country: JSON.parse(req.body.country),
    currency: req.body.currency
  }
  if (req.body.city != "" ||
    req.body.city != null ||
    typeof req.body.city != "undefined") {
    editData.city = req.body.city
  }
  if (req.body.about != "" ||
    req.body.about != null ||
    typeof req.body.about != "undefined") {
    editData.about = req.body.about
  }
  if (req.body.include == "" ||
    req.body.include == null ||
    typeof req.body.include == "undefined") {
    editData.include = null
  } else {
    editData.include = JSON.parse(req.body.include)
  }


  console.log(req.file);
  if (req.file != null &&
    req.file != "" &&
    typeof req.file != "undefined") {
    let image_url = await Upload.uploadFile(req, "profile_pics");
    editData.image = image_url;
  }

  var profile = await User.findOne(
    { _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } }
  ).exec();

  if (profile != null || profile != "") {
    User.findOneAndUpdate(
      { _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } },
      editData,
      { new: true },
      (err, docs) => {
        if (!err) {
          res.status(200).json({
            status: true,
            message: "Profile successfully updated.",
            data: docs
          });
        }
        else {
          res.status(500).json({
            status: false,
            message: "Failed to update profile. Server error.",
            error: err
          });
        }
      }
    )
  }
  else {
    return res.status(500).json({
      status: false,
      message: "Profile details not found. Server error.",
      data: profile
    });
  }
}

const updatePassword = async (req, res) => {
  const V = new Validator(req.body, {
    old_password: 'required',
    new_password: 'required',// |minLength:8
    cnf_password: 'required' // |minLength:8
  });
  let matched = V.check().then(val => val);

  if (!matched) {
    return res.status(400).json({
      status: false,
      errors: V.errors
    });
  }
  // if new password and confirm password is same
  if (req.body.cnf_password == req.body.new_password) {
    // if new pw and old pw is same
    if (req.body.new_password == req.body.old_password) {
      return res.status(500).json({
        status: false,
        message: "New and old password is same",
        data: null
      });
    }
    // if new and old password is not same, then update
    else {
      User.findOne({ _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } })
        .then(user => {
          // if old password value matched & return true from database
          if (user.comparePassword(req.body.old_password) === true) {
            User.findOneAndUpdate(
              { _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } },
              { password: passwordHash.generate(req.body.new_password) },
              { returnDocument: true },
              (fault, docs) => {
                if (!fault) {
                  res.status(200).json({
                    status: true,
                    message: "Password updated successfully",
                    data: docs
                  });
                }
                else {
                  res.status(500).json({
                    status: false,
                    message: "Failed to update password.Server error.",
                    error: fault
                  });
                }
              }
            )
          }
          // if old password value is incorrectly provided
          else {
            res.status(500).json({
              status: false,
              message: "Old password is incorrect.",
              data: null
            });
          }
        })
        .catch(err => {
          res.status(500).json({
            status: false,
            message: "No profile details found. Server error.",
            error: err
          });
        })
    }
  }
  // if new and confirm pw does not match
  else {
    return res.status(400).json({
      status: false,
      message: "Confirmed password doesn't match with new password",
      data: null
    });
  }
}

var downloadReceipt = async (req, res) => {
  var id = req.params.id;

  let prodCheckout = await Checkout.findOne({ _id: mongoose.Types.ObjectId(id) }).exec()
  let savedAddr = await userAddress.findOne(
    {
      userid: prodCheckout.user_id,
      shipping: true
    }
  ).exec()
  let prodCart = await Cart.aggregate([
    {
      $match: {
        order_id: prodCheckout.order_id
      }
    },
    {
      $lookup: {
        from: "products",
        localField: "prod_id",
        foreignField: "_id",
        as: "product_data"
      }
    },
    {
      $unwind: "$product_data"
    }
  ]).exec()

  var itemArr = []
  prodCart.forEach(element => {
    itemArr.push(
      {
        name: element.productname,
        price_num: element.price,
        price: element.product_data.currency + " " + element.price,
        quantity: element.qty,
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
        name: prodCheckout.firstname + " " + prodCheckout.lastname,
        address: prodCheckout.address1,
        // city: prodCheckout.city,
        state: prodCheckout.state,
        country: prodCheckout.country,
        postalCode: prodCheckout.zip
      }
    },
    memo: 'As discussed',
    order_id: prodCheckout.order_id,
    items: itemArr,
    subtotal: prodCheckout.subtotal,
    paid: prodCheckout.total,
    currency: prodCart[0].product_data.currency,
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

module.exports = {
  viewAll,
  refundProduct,
  updateProfile,
  updatePassword,
  downloadReceipt
}