var mongoose = require('mongoose')
var Admin = require('../../Models/admin')
var passwordHash = require('password-hash');
var Upload = require('../../service/upload')

var jwt = require('jsonwebtoken');
const { Validator } = require('node-input-validator');

// Admin update profile of user
const updateProfile = async (req, res) => {

  let editData = {
    fullname: req.body.firstName,
    email: req.body.email,
    password: req.body.password, // hidden
    address: req.body.address
  }

  if (
    req.body.mobile != "" ||
    req.body.mobile != null ||
    typeof req.body.mobile != "undefined"
  ) {
    editData.mobile = req.body.mobile;
  }

  console.log(req.file);
  if (req.file != null &&
    req.file != "" &&
    typeof req.file != "undefined") {
    let image_url = await Upload.uploadFile(req, "profile_pics");
    editData.image = image_url;
  }

  var profile = await Admin.findOne(
    { _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } }
  ).exec();

  if (profile != null || profile != "") {
    Admin.findOneAndUpdate(
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
      Admin.findOne({ _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } })
        .then(admin => {
          // if old password value matched & return true from database
          if (admin.comparePassword(req.body.old_password) === true) {
            Admin.findOneAndUpdate(
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

const getProfile = async (req, res) => {
  console.log(req.params.id)
  Admin.findOne({ _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } })
    .then(admin => {

      return res.status(200).json({
        status: true,
        data: admin
      });


    })
    .catch(err => {
      return res.status(500).json({
        status: false,
        message: "No profile details found. Server error.",
        error: err
      });
    })
}

module.exports = {
  updateProfile,
  updatePassword,
  getProfile
}