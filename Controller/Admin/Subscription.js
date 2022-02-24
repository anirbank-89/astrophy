var mongoose = require("mongoose");
var moment = require("moment");
const { Validator } = require("node-input-validator");

var Subsciption = require("../../Models/subscription");
var SubscribedBy = require("../../Models/subscr_purchase");

const create = async (req, res) => {
  let v = new Validator(req.body, {
    name: 'required',
    description: 'required',
    duration: 'required',
    country: 'required',
    currency: 'required',
    price: 'required',
    seller_commission_value: 'required'
  });

  let matched = await v.check().then((val) => val);
  if (!matched) {
    return res.status(400).send({
      status: false,
      error: v.errors,
    });
  }

  let subdata = {
    _id: mongoose.Types.ObjectId(),
    name: req.body.name,
    description: req.body.description,
    duration: req.body.duration,
    country: req.body.country,
    currency: req.body.currency,
    price: req.body.price,
    seller_commission_value: req.body.seller_commission_value,
  }
  if (req.body.type != "" || req.body.type != null || typeof req.body.type != "undefined") {
    subdata.type = req.body.type;
  }
  if (req.body.no_of_listing != "" || req.body.no_of_listing != null || typeof req.body.no_of_listing != "undefined") {
    subdata.no_of_listing = req.body.no_of_listing;
  }
  if (req.body.plan_id != "" || req.body.plan_id != null || typeof req.body.plan_id != "undefined") {
    subdata.plan_id = req.body.plan_id;
  }

  let subscriptionSchema = new Subsciption(subdata);

  return subscriptionSchema
    .save()
    .then((data) => {
      res.status(200).send({
        status: true,
        message: "Subscription Added Successfully",
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).send({
        status: false,
        message: "Server error. Please try again.",
        error: err.message,
      });
    });
};

const viewAll = async (req, res) => {
  return Subsciption.aggregate([
    { $sort: { _id: -1 } },
    {
      $project: {
        _v: 0,
      },
    },
  ])
    .then((data) => {
      res.status(200).json({
        status: true,
        message: "Subscription Data Get Successfully",
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        message: "Server error. Please try again.",
        error: error,
      });
    });
};

const viewSubById = async (req, res) => {
  var id = req.params.id;
}

const update = async (req, res) => {
  const V = new Validator(req.body, {
    name: 'required',
    description: 'required',
    duration: 'required',
    country: 'required',
    currency: 'required',
    price: 'required',
    seller_commission_value: 'required'
  });
  let matched = await V.check().then(val => val);

  if (!matched) {
    return res.status(400).json({ status: false, errors: V.errors });
  }

  var id = req.params.id;

  return Subsciption.findOneAndUpdate(
    { _id: mongoose.Types.ObjectId(id) },
    req.body,
    { new: true }
  )
    .then(docs => {
      res.status(200).json({
        status: true,
        message: "Data successfully edited.",
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

const Delete = async (req, res) => {
  return Subsciption.remove({
    _id: { $in: [mongoose.Types.ObjectId(req.parms.id)] },
  })
    .then((data) => {
      return res.status(200).json({
        status: true,
        message: "Subscription delete successfully",
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        message: "Server error. Please try again.",
        error: error,
      });
    });
};

const subscriptionHistory = async (req, res) => {
  return SubscribedBy.aggregate([
    {
      $lookup: {
        from: "subscriptions",
        localField: "subscr_id",
        foreignField: "_id",
        as: "subscription_data"
      }
    },
    // {
    //   $unwind: {
    //     path: "$subscription_data",
    //     preserveNullAndEmptyArrays: true
    //   }
    // },
    {
      $lookup: {
        from: "users",
        localField: "userid",
        foreignField: "_id",
        as: "user_data"
      }
    },
    { $sort: { _id: -1 } },
    { $project: { __v: 0 } }
  ])
    .then(docs => {
      console.log(docs);
      res.status(200).json({
        status: true,
        message: "Data successfully get.",
        data: docs
      });
    })
    .catch(err => {
      res.status(500).json({
        status: false,
        message: "Failed to get data. Server error.",
        error: err.message
      });
    })
}

const subscriptionHistoryRepo = async (req, res) => {
  return SubscribedBy.aggregate([
    req.body.datefrom != "" &&
      typeof req.body.datefrom != "undefined" &&
      req.body.dateto != "" &&
      typeof req.body.dateto != "undefined"
      ? {
        $match: {
          subscribed_on: {
            $gt: new Date(req.body.datefrom),
            $lte: moment.utc(req.body.dateto).endOf("day").toDate(),
          },
        },
      }
      : { $project: { __v: 0 } },
    {
      $lookup: {
        from: "subscriptions",
        localField: "subscr_id",
        foreignField: "_id",
        as: "subscription_data",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userid",
        foreignField: "_id",
        as: "user_data",
      },
    },
    { $unwind: "$user_data" },
    { $sort: { _id: -1 } },
  ])
    .then((data) => {
      if (data != null && data != "") {
        res.status(200).send({
          status: true,
          data: data,
          error: null,
          message: "Subscription History Data Get Successfully",
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

const setStatus = async (req, res) => {
  var id = req.params.id;

  var current_status = await Subsciption.findById({ _id: id }).exec();

  console.log("Subscription data", current_status);

  if (current_status.status === true) {
    console.log(true);
    return Subsciption.findByIdAndUpdate(
      { _id: id },
      { $set: { status: false } },
      { new: true },
      (err, docs) => {
        if (!err) {
          res.status(200).json({
            status: true,
            message: "Subsciption plan has been made inactive.",
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
    return Subsciption.findByIdAndUpdate(
      { _id: id },
      { $set: { status: true } },
      { new: true },
      (err, docs) => {
        if (!err) {
          res.status(200).json({
            status: true,
            message: "Subsciption plan has been activated.",
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

module.exports = {
  create,
  viewAll,
  viewSubById,
  update,
  Delete,
  subscriptionHistory,
  subscriptionHistoryRepo,
  setStatus
};
