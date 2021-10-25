var mongoose = require('mongoose');
var Coupon = require("../../Models/coupon");

var jwt = require('jsonwebtoken');

const { Validator } = require('node-input-validator');

var uuidv1 = require('uuid').v1;

const create = async (req, res) => {
    const v = new Validator(req.body, {
        name: "required",
        minprice: "required",
        percent: "required",
        expdate: "required",
        discount_type:"required",
        discount_value:"discount_type",
        applicable_date:"required",
        times: "required",

    })

    let matched = await v.check().then((val) => val)
    if (!matched) {
        return res.status(200).send({
            status: false,
            error: v.errors
        })
    }

    let prductData = {
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        minprice: req.body.minprice,
        percent: req.body.percent,
        expdate: req.body.expdate,
        discount_type:req.body.discount_type,
        discount_value:req.body.discount_value,
        applicable_date:req.body.applicable_date,
        times: req.body.times
    }

    const productSave = await new Coupon(prductData)

    return productSave
        .save()
        .then((data) => {
            res.status(200).json({
                status: true,
                data: data,
                message: "Coupon added successfully"
            })
        })
        .catch((err) => {
            res.status(500).json({
                status: false,
                message: "Server error. Please try again.",
                error: err,
            });
        })
}

const viewAll = async (req, res) => {
    return Coupon.aggregate(
        [
            { $sort: { _id: -1 } },
            {
                $project: {
                    _v: 0
                }
            }
        ]
    ).then((data) => {
        res.status(200).json({
            status: true,
            message: 'Coupon Data Get Successfully',
            data: data
        })
    })
        .catch((err) => {
            res.status(500).json({
                status: false,
                message: "Server error. Please try again.",
                error: error,
            });
        })
}

const update = async (req, res) => {

    return Coupon.findOneAndUpdate(
        { _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } },
        req.body,
        async (err, data) => {
            console.log(data);
            if (err) {
                res.status(500).json({
                    status: false,
                    message: "Server error. Please try again.",
                    error: err,
                });
            }
            else if (data != null) {
                data = { ...req.body, ...data._doc };
                res.status(200).json({
                    status: true,
                    message: "Coupon update successful",
                    data: data,
                });
            } else {
                res.status(500).json({
                    status: false,
                    message: "User not match",
                    data: null,
                });
            }

        }
    )

}
const Delete = async (req, res) => {
    return Coupon.remove(
        { _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } })
        .then((data) => {
            return res.status(200).json({
                status: true,
                message: 'Coupon delete successfully',
                data: data
            });
        })
        .catch((err) => {
            res.status(500).json({
                status: false,
                message: 'Server error. Please try again.',
                error: error,
            });
        })

}

const setStatus = async (req, res) => {
    var id = req.params.id;

    var current_status = await Coupon.findById({ _id: id }).exec();

    console.log("Subscription data", current_status);

    if (current_status.status === true) {
        console.log(true);
        return Coupon.findByIdAndUpdate(
            { _id: id },
            { $set: { status: false } },
            { new: true },
            (err, docs) => {
                if (!err) {
                    res.status(200).json({
                        status: true,
                        message: "Coupon has been made inactive.",
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
        return Coupon.findByIdAndUpdate(
            { _id: id },
            { $set: { status: true } },
            { new: true },
            (err, docs) => {
                if (!err) {
                    res.status(200).json({
                        status: true,
                        message: "Coupon has been activated.",
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
    update,
    Delete,
    setStatus
}
