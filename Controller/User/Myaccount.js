var mongoose = require('mongoose')
var Checkout = require('../../Models/checkout')
var Coupon = require('../../Models/coupon')
var User = require('../../Models/user')
var Cart = require('../../Models/cart')
var Upload = require('../../service/upload')

var passwordHash = require('password-hash')
const { Validator } = require('node-input-validator')


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
          res.status(200).json({
            status: true,
            message: "Order Cancel successful",
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
    include: req.body.include
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
      {returnNewDocument: true},
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

  if (req.body.cnf_password == req.body.new_password) {
    if (req.body.new_password == req.body.old_password) {
      return res.status(500).json({
        status: false,
        message:  "New and old password is same",
        data: null
      });
    }
    else {
      User.findOne({_id: {$in:[mongoose.Types.ObjectId(req.params.id)]}})
      .then(user=>{
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