var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var uuidv1 = require('uuid').v1;
var Service = require('../../Models/service');
var Upload = require("../../service/upload");
const Servicecommission = require("../../Models/servicecommission");

const { Validator } = require('node-input-validator');

const create = async (req, res) => {
    const v = new Validator(req.body, {
        name: "required",
        description: "required"
    });

    let matched = await v.check().then((val) => val);
    if (!matched) {
        return res.status(200).send({
            status: false,
            error: v.errors
        });
    }
    if (typeof (req.file) == 'undefined' || req.file == null) {
        return res.status(200).send({
            status: true,
            error: {
                "image": {
                    "message": "The image field is mandatory.",
                    "rule": "required"
                }
            }
        });
    }
    let image_url = await Upload.uploadFile(req, "services");
    let serviceData = {
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        description: req.body.description,
        image: image_url
    }

    let service_category = await new Service(serviceData);

    return service_category.save()
        .then((data) => {
            res.status(200).json({
                status: true,
                data: data,
                message: "Service category added successfully!"
            });
        })
        .catch((err) => {
            res.status(500).json({
                status: false,
                message: "Server error. Please try again.",
                error: err
            });
        });
}

const viewAllServices = async (req, res) => {
    return Service.find()
        .then((docs) => {
            res.status(200).json({
                status: true,
                message: "All services get successfully.",
                data: docs
            });
        })
        .catch((err) => {
            res.status(500).json({
                status: false,
                message: "Server error. Please try again.",
                errors: err
            });
        }).sort({ _id: 'desc' });
}

const update = async (req, res) => {
    const v = new Validator({
        name: "required",
        description: "required",
    });

    let matched = await v.check().then((val) => val);
    if (!matched) {
        return res.status(200).send({
            status: false,
            error: v.errors
        });
    }
    console.log(req.file)
    if (typeof (req.file) != "undefined" || req.file != null) {
        let image_url = await Upload.uploadFile(req, "services");
        req.body.image = image_url;
    }

    return Service.findOneAndUpdate(
        { _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } },
        req.body,
        async (err, docs) => {
            if (err) {
                res.status(500).json({
                    status: false,
                    message: "Server error. Please try again.",
                    error: err
                });
            }
            else if (docs != null) {
                res.status(200).json({
                    status: true,
                    message: "Service category updated successfully!",
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

const Delete = async (req, res) => {
    return Service.remove({ _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } })
        .then((docs) => {
            res.status(200).json({
                status: true,
                message: "Service category deleted successfully!",
                data: docs
            });
        })
        .catch((err) => {
            res.status(500).json({
                status: false,
                message: "Server error. Please try again.",
                error: err
            });
        });
}

const setStatus = async (req, res) => {
    var id = req.params.id;

    var current_status = await Service.findById({ _id: id }).exec();

    console.log("Category data", current_status);

    if (current_status.status === true) {
        console.log(true);
        return Service.findByIdAndUpdate(
            { _id: id },
            { $set: { status: false } },
            { new: true },
            (err, docs) => {
                if (!err) {
                    res.status(200).json({
                        status: true,
                        message: "Category has been made inactive.",
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
        return Service.findByIdAndUpdate(
            { _id: id },
            { $set: { status: true } },
            { new: true },
            (err, docs) => {
                if (!err) {
                    res.status(200).json({
                        status: true,
                        message: "Category has been activated.",
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
            $match: { seller_id: { $in: [mongoose.Types.ObjectId(req.body.id)] } },
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

  const updateAdminaccept = async (req, res) => {

    return Servicecommission.findOneAndUpdate(
        { _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } },
        req.body,
        async (err, docs) => {
            if (err) {
                res.status(500).json({
                    status: false,
                    message: "Server error. Please try again.",
                    error: err
                });
            }
            else if (docs != null) {
                res.status(200).json({
                    status: true,
                    message: "Service Comission updated successfully!",
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

module.exports = {
    create,
    viewAllServices,
    update,
    Delete,
    setStatus,
    sellercomHistory,
    updateAdminaccept
}