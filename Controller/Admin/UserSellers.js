var mongoose = require('mongoose');
var User = require("../../Models/user");
var passwordHash = require('password-hash')
const Servicecommission = require("../../Models/servicecommission");
var jwt = require('jsonwebtoken');
var Upload = require("../../service/upload");
const Withdraw = require("../../Models/withdraw");
const Kyc = require("../../Models/kyc");
const Totalcomission = require("../../Models/totalcomission");
const SELLER = require('../../Models/seller');

const { Validator } = require('node-input-validator');

var uuidv1 = require('uuid').v1;

const viewUserList = async (req, res) => {
  if (req.body.device_type == "") {
    return User.find(
      { type: { $in: "User" } },
      (err, docs) => {
        if (err) {
          res.status(400).json({
            status: false,
            message: "Server error. Data not available",
            error: err
          });
        }
        else {
          res.status(200).json({
            status: true,
            message: "Users get successfully",
            data: docs
          });
        }
      }).sort({ _id: 'desc' });
  }
  else if (req.body.device_type == "Web") {
    return User.find(
      { type: "User", device_type: "Web" },
      (err, docs) => {
        if (err) {
          res.status(400).json({
            status: false,
            message: "Server error. Data not available",
            error: err
          });
        }
        else {
          res.status(200).json({
            status: true,
            message: "Users get successfully",
            data: docs
          });
        }
      }).sort({ _id: 'desc' });
  }
  else if (req.body.device_type == "App") {
    return User.find(
      { type: "User", device_type: "App" },
      (err, docs) => {
        if (err) {
          res.status(400).json({
            status: false,
            message: "Server error. Data not available",
            error: err
          });
        }
        else {
          res.status(200).json({
            status: true,
            message: "Users get successfully",
            data: docs
          });
        }
      }).sort({ _id: 'desc' });
  }
}

const viewUser = async (req, res) => {
  let id = req.params.id;
  return User.findOne(
    { _id: { $in: [mongoose.Types.ObjectId(id)] } },
    (err, docs) => {
      if (err) {
        res.status(400).json({
          status: false,
          message: "Server error. Data not available",
          error: err
        });
      }
      else {
        res.status(200).json({
          status: true,
          message: "User get successfully",
          data: docs
        });
      }
    });
}

const viewSellerList = async (req, res) => {
  if (req.body.device_type == "") {
    return User.aggregate([
      {
        $match: {
          type: "Seller",
        },
      },
      {
        $lookup: {
          from: "shops",
          localField: "_id",
          foreignField: "userid",
          as: "shop_data"
        }
      },
      {
        $lookup: {
          from: "shop_services",
          localField: "_id",
          foreignField: "seller_id",
          as: "service_data"
        },
      },
      {
        $lookup: {
          from: "totalcomissions",
          localField: "_id",
          foreignField: "seller_id",
          as: "totalcommission_data"
        }
      },
      {
        $lookup: {
          from: "sellercomissions",
          let: { seller_id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$seller_id", "$$seller_id"] },
                    { $eq: ["$status", true] }
                  ]
                }
              },
            }
          ],
          as: "commission_data"
        }
      },
      {
        $lookup: {
          from: "total_service_commission_refunds",
          localField: "_id",
          foreignField: "seller_id",
          as: "totalservicecom_refund_data"
        }
      },
      {
        $addFields: {
          total_commission_earned: {
            $sum: {
              $map: {
                input: "$totalcommission_data",
                in: "$$this.comission_total"
              }
            }
          }
        }
      },
      {
        $addFields: {
          settled_and_claimable_commission: {
            $sum: {
              $map: {
                input: "$commission_data",
                in: "$$this.seller_commission"
              }
            }
          }
        }
      },
      {
        $addFields: {
          commission_refunded: {
            $sum: {
              $map: {
                input: "$totalservicecom_refund_data",
                in: "$$this.total_refunded"
              }
            }
          }
        }
      },
      { $sort: { _id: -1 } },
      {
        $project: {
          _v: 0,
        },
      },
    ])
      .then((data) => {
        if (data != null && data != "") {
          res.status(200).send({
            status: true,
            data: data,
            error: null,
            message: "Sellers get successfully",
          });
        } else {
          res.status(400).send({
            status: false,
            data: null,
            error: "No Data",
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          status: false,
          data: null,
          error: err,
          message: "Server Error",
        });
      });
  }
  else if (req.body.device_type == "Web") {
    return User.aggregate([
      {
        $match: {
          type: "Seller",
          device_type: "Web"
        },
      },
      {
        $lookup: {
          from: "shops",
          localField: "_id",
          foreignField: "userid",
          as: "shop_data"
        }
      },
      {
        $lookup: {
          from: "shop_services",
          localField: "_id",
          foreignField: "seller_id",
          as: "service_data"
        },
      },
      {
        $lookup: {
          from: "totalcomissions",
          localField: "_id",
          foreignField: "seller_id",
          as: "totalcommission_data"
        }
      },
      {
        $lookup: {
          from: "sellercomissions",
          let: { seller_id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$seller_id", "$$seller_id"] },
                    { $eq: ["$status", true] }
                  ]
                }
              },
            }
          ],
          as: "commission_data"
        }
      },
      {
        $lookup: {
          from: "total_service_commission_refunds",
          localField: "_id",
          foreignField: "seller_id",
          as: "totalservicecom_refund_data"
        }
      },
      {
        $addFields: {
          total_commission_earned: {
            $sum: {
              $map: {
                input: "$totalcommission_data",
                in: "$$this.comission_total"
              }
            }
          }
        }
      },
      {
        $addFields: {
          settled_and_claimable_commission: {
            $sum: {
              $map: {
                input: "$commission_data",
                in: "$$this.seller_commission"
              }
            }
          }
        }
      },
      {
        $addFields: {
          commission_refunded: {
            $sum: {
              $map: {
                input: "$totalservicecom_refund_data",
                in: "$$this.total_refunded"
              }
            }
          }
        }
      },
      { $sort: { _id: -1 } },
      {
        $project: {
          _v: 0,
        },
      },
    ])
      .then((data) => {
        if (data != null && data != "") {
          res.status(200).send({
            status: true,
            data: data,
            error: null,
            message: "Sellers get successfully",
          });
        } else {
          res.status(400).send({
            status: false,
            data: null,
            error: "No Data",
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          status: false,
          data: null,
          error: err,
          message: "Server Error",
        });
      });
  }
  else if (req.body.device_type == "App") {
    return User.aggregate([
      {
        $match: {
          type: "Seller",
          device_type: "App"
        },
      },
      {
        $lookup: {
          from: "shops",
          localField: "_id",
          foreignField: "userid",
          as: "shop_data"
        }
      },
      {
        $lookup: {
          from: "shop_services",
          localField: "_id",
          foreignField: "seller_id",
          as: "service_data"
        },
      },
      {
        $lookup: {
          from: "totalcomissions",
          localField: "_id",
          foreignField: "seller_id",
          as: "totalcommission_data"
        }
      },
      {
        $lookup: {
          from: "sellercomissions",
          let: { seller_id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$seller_id", "$$seller_id"] },
                    { $eq: ["$status", true] }
                  ]
                }
              },
            }
          ],
          as: "commission_data"
        }
      },
      {
        $lookup: {
          from: "total_service_commission_refunds",
          localField: "_id",
          foreignField: "seller_id",
          as: "totalservicecom_refund_data"
        }
      },
      {
        $addFields: {
          total_commission_earned: {
            $sum: {
              $map: {
                input: "$totalcommission_data",
                in: "$$this.comission_total"
              }
            }
          }
        }
      },
      {
        $addFields: {
          settled_and_claimable_commission: {
            $sum: {
              $map: {
                input: "$commission_data",
                in: "$$this.seller_commission"
              }
            }
          }
        }
      },
      {
        $addFields: {
          commission_refunded: {
            $sum: {
              $map: {
                input: "$totalservicecom_refund_data",
                in: "$$this.total_refunded"
              }
            }
          }
        }
      },
      { $sort: { _id: -1 } },
      {
        $project: {
          _v: 0,
        },
      },
    ])
      .then((data) => {
        if (data != null && data != "") {
          res.status(200).send({
            status: true,
            data: data,
            error: null,
            message: "Sellers get successfully",
          });
        } else {
          res.status(400).send({
            status: false,
            data: null,
            error: "No Data",
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          status: false,
          data: null,
          error: err,
          message: "Server Error",
        });
      });
  }
}

const viewSeller = async (req, res) => {
  let id = req.params.id;
  return User.findOne(
    { _id: { $in: [mongoose.Types.ObjectId(id)] } },
    (err, docs) => {
      if (err) {
        res.status(400).json({
          status: false,
          message: "Server error. Data not available",
          error: err
        });
      }
      else {
        res.status(200).json({
          status: true,
          message: "Seller get successfully",
          data: docs
        });
      }
    });
}

const setStatus = async (req, res) => {
  var id = req.params.id;

  var current_status = await User.findById({ _id: id }).exec();

  console.log("Subscription data", current_status);

  if (current_status.status === true) {
    console.log(true);
    return User.findByIdAndUpdate(
      { _id: id },
      { $set: { status: false } },
      { new: true },
      (err, docs) => {
        if (!err) {
          res.status(200).json({
            status: true,
            message: "User has been made inactive.",
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
    return User.findByIdAndUpdate(
      { _id: id },
      { $set: { status: true } },
      { new: true },
      (err, docs) => {
        if (!err) {
          res.status(200).json({
            status: true,
            message: "User has been activated.",
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

const setBlock = async (req, res) => {
  var id = req.params.id;

  var current_status = await User.findById({ _id: id }).exec();

  console.log("user data", current_status);

  if (current_status.block === true) {
    console.log(true);
    return User.findByIdAndUpdate(
      { _id: id },
      { $set: { block: false } },
      { new: true },
      (err, docs) => {
        if (!err) {
          res.status(200).json({
            status: true,
            message: "User has been made unblocked.",
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
    return User.findByIdAndUpdate(
      { _id: id },
      { $set: { block: true } },
      { new: true },
      (err, docs) => {
        if (!err) {
          res.status(200).json({
            status: true,
            message: "User has been blocked.",
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

const sellercomHistory = async (req, res) => {
  return Servicecommission.aggregate([
    {
      $match: { seller_id: { $in: [mongoose.Types.ObjectId(req.params.id)] } },
    },
    {
      $project: {
        _v: 0,
      },
    },
    {
      $lookup: {
        from: "servicecheckouts",
        localField: "order_id",
        foreignField: "_id",
        as: "booking_data",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "seller_id",
        foreignField: "_id",
        as: "seller_data",
      },
    },
    { $sort: { _id: -1 } },
  ])
    .then((data) => {
      if (data != null && data != "") {
        res.status(200).send({
          status: true,
          data: data,
          error: null,
          message: "Comission history Get Successfully",
        });
      } else {
        res.status(400).send({
          status: false,
          data: null,
          error: "No Data",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        status: false,
        data: null,
        error: err,
        message: "Server Error",
      });
    });
};

const paycomsion = async (req, res) => {
  if (typeof (req.file) != "undefined" || req.file != null) {
    let image_url = await Upload.uploadFile(req, "comision");
    req.body.image = image_url;
  }
  req.body.transactionid = req.body.txnid
  req.body.paystatus = true
  req.body.paydate_on = new Date().toISOString().slice(0, 10)
  // console.log(req.body);
  // return false;
  let totalcomission = await Totalcomission.findOne({ seller_id: mongoose.Types.ObjectId(req.body.seller_id) }).exec();

  return Withdraw.findOneAndUpdate(
    { _id: { $in: [mongoose.Types.ObjectId(req.body.id)] } },
    req.body,
    { new: true },
    async (err, docs) => {
      if (err) {
        res.status(500).json({
          status: false,
          message: "Server error. Please try again.",
          error: err
        });
      }
      else if (docs != null) {
        let newAmt = parseInt(totalcomission.comission_total) - parseInt(docs.amount)
        Totalcomission.findOneAndUpdate(
          { seller_id: mongoose.Types.ObjectId(docs.seller_id) },
          { $set: { comission_total: newAmt } },
          (err, writeResult) => {
            // console.log(err);
          }
        );
        res.status(200).json({
          status: true,
          message: "Paid successfully!",
          data: docs
        });
      }
      else {
        res.status(500).json({
          status: false,
          message: "User do not match",
          data: null
        });
      }
    }
  );
}

const withdrawHistory = async (req, res) => {
  return Withdraw.aggregate([
    {
      $match: { seller_id: { $in: [mongoose.Types.ObjectId(req.params.id)] } },
    },
    {
      $project: {
        _v: 0,
      },
    },
    { $sort: { _id: -1 } },
  ])
    .then((data) => {
      if (data != null && data != "") {
        res.status(200).send({
          status: true,
          data: data,
          error: null,
          message: "Withdraw history Get Successfully",
        });
      } else {
        res.status(400).send({
          status: false,
          data: null,
          error: "No Data",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        status: false,
        data: null,
        error: err,
        message: "Server Error",
      });
    });
};

const getKyc = async (req, res) => {

  let shopData = await Kyc.find({ seller_id: { $in: [mongoose.Types.ObjectId(req.params.id)] } }).exec();

  res.status(200).json({
    status: true,
    message: "Kyc updated successfully!",
    data: shopData
  });

}

const setPriority = async (req, res) => {

  let editData = {
    priority: req.body.priority
  }

  User.findOneAndUpdate(
    { _id: { $in: [mongoose.Types.ObjectId(req.body.seler_id)] } },
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

var getSellerRequest = async (req, res) => {
  let requests = await SELLER.find({}).exec();

  if (requests.length > 0) {
    return res.status(200).json({
      status: true,
      message: "Data successfully get.",
      data: requests
    });
  }
  else {
    return res.status(200).json({
      status: true,
      message: "No pending requests.",
      data: []
    });
  }
}

var approveSellerRequest = async (req, res) => {
  var id = req.params.id;

  return SELLER.findOneAndUpdate(
    { _id: mongoose.Types.ObjectId(id) },
    { $set: { seller_status: true } },
    { new: true }
  )
    .then(data => {
      User.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(data.seller_id) },
        {
          $set: {
            type: "Seller",
            seller_approval: true
          }
        }
      )
        .then(docs => {
          res.status(200).json({
            status: true,
            message: "Data successfully edited.",
            data: data
          });
        })
        .catch(fault => {
          res.status(500).json({
            status: false,
            message: "Invalid id. Server error 2.",
            error: err
          });
        });
    })
    .catch(err => {
      res.status(500).json({
        status: false,
        message: "Invalid id. Server error 1.",
        error: err
      });
    });
}

var rejectSellerRequest = async (req, res) => {
  var id = req.params.id;

  return SELLER.findOneAndUpdate(
    { _id: mongoose.Types.ObjectId(id) },
    { $set: { ask_permission: false } },
    { new: true }
  )
    .then(data => {
      res.status(200).json({
        status: true,
        message: "Data successfully edited.",
        data: data
      });
    })
    .catch(err => {
      res.status(500).json({
        status: false,
        message: "Invalid id. Server error.",
        error: err
      });
    });
}

module.exports = {
  viewUserList,
  viewUser,
  viewSellerList,
  viewSeller,
  setStatus,
  setBlock,
  sellercomHistory,
  paycomsion,
  withdrawHistory,
  getKyc,
  setPriority,
  getSellerRequest,
  approveSellerRequest,
  rejectSellerRequest
}