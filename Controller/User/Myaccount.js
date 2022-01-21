var mongoose = require('mongoose')
var passwordHash = require('password-hash')
const { Validator } = require('node-input-validator')

var Checkout = require('../../Models/checkout')
var User = require('../../Models/user')
var ProductRefund = require('../../Models/product_refund')
var Upload = require('../../service/upload')


const viewAll = async (req,res)=>{
    return Checkout.aggregate(
        [
            {
                $match: {
                    user_id: mongoose.Types.ObjectId(req.params.user_id),
                },
            },
            {
                $lookup:{
                    from:"carts",//
                    localField:"order_id",//
                    foreignField:"order_id",
                    as:"cart_data"//
                }
            },
            {
              $sort:{
                _id: -1
              }
            },
            {
                $project:{
                    _v:0
                }
            }
        ]
    )
    .then((docs)=>{
        res.status(200).json({
            status: true,
            message: "Order History get successfully",
            data: docs
        })
    })
    .catch((err)=>{
        res.status(500).json({
            status: false,
            message: "Server error. Please try again.",
            error: err
        })
    })
}

const refundProduct = async (req, res) => {
    return Checkout.findOneAndUpdate(
      { _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } },
      {status:'cancel'},
      {new: true},
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
            user_id: mongoose.Types.ObjectId(data.user_id),
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
  };

const updateProfile = async (req,res)=>{
  const V = new Validator(req.body,{
    // email, password should be made unable for edit in frontend
    email:'required|email',
    password:'required',// |minLength:8
    firstName: 'required',
    lastName: 'required'
  });
  let matched = V.check().then(val=>val);
  if (!matched) {
    return res.status(400).json({status: false, errors: V.errors});
  }
  
  let editData = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    city: req.body.city,
    about: req.body.about,
  }
  
  if (req.body.include=="" || 
      req.body.include==null || 
      typeof req.body.include=="undefined" ) {
        editData.include = null
      } else {
        editData.include = JSON.parse(req.body.include)
      }


  console.log(req.file);
  if (req.file!=null && 
      req.file!="" && 
      typeof req.file!="undefined") {
        let image_url = await Upload.uploadFile(req, "profile_pics");
        editData.image = image_url;
  }

  var profile = await User.findOne(
    {_id: {$in:[mongoose.Types.ObjectId(req.params.id)]}}
    ).exec();

  if(profile!=null || profile!="") {
    User.findOneAndUpdate(
      {_id: {$in:[mongoose.Types.ObjectId(req.params.id)]}},
      editData,
      {new: true},
      (err,docs)=>{
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

const updatePassword = async (req,res)=>{
  const V = new Validator(req.body,{
    old_password: 'required',
    new_password: 'required',// |minLength:8
    cnf_password: 'required' // |minLength:8
  });
  let matched = V.check().then(val=>val);

  if(!matched) {
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
        message:  "New and old password is same",
        data: null
      });
    }
    // if new and old password is not same, then update
    else {
      User.findOne({_id: {$in:[mongoose.Types.ObjectId(req.params.id)]}})
      .then(user=>{
        // if old password value matched & return true from database
        if(user.comparePassword(req.body.old_password) === true) {
          User.findOneAndUpdate(
            {_id: {$in:[mongoose.Types.ObjectId(req.params.id)]}},
            {password: passwordHash.generate(req.body.new_password)},
            {returnDocument: true},
            (fault, docs)=>{
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
      .catch(err=>{
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

module.exports = {
    viewAll,
    refundProduct,
    updateProfile,
    updatePassword
}