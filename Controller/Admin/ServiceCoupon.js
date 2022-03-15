var mongoose = require('mongoose');
const { Validator } = require('node-input-validator');

var Coupon = require("../../Models/servicecoupon");

const create = async (req, res) => {
    const v = new Validator(req.body, {
        name: "required",
        minprice: "required",
        discount_type: "required",
        expdate: "required",
        // applicable_date:"required",
        times: "required",

    })

    let matched = await v.check().then((val) => val)
    if (!matched) {
        return res.status(400).send({
            status: false,
            error: v.errors
        })
    }

    let couponData = {
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        minprice: req.body.minprice,
        discount_type: req.body.discount_type,
        expdate: req.body.expdate,
        // applicable_date:req.body.applicable_date,
        times: req.body.times
    }
    if (req.body.percent != "" || req.body.percent != null || typeof req.body.percent != "undefined") {
        couponData.percent = req.body.percent;
    }
    if (req.body.discount_value != "" || req.body.discount_value != null || typeof req.body.discount_value != "undefined") {
        couponData.discount_value = req.body.discount_value;
    }

    const NEW_COUPON = await new Coupon(couponData)

    return NEW_COUPON
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
            })
        })
}

const viewById = async (req,res) => {
    var id = req.params.id;

    return Coupon.findOne({ _id: mongoose.Types.ObjectId(id) })
        .then(docs => {
            res.status(200).json({
                status: true,
                message: 'Coupon Data Get Successfully',
                data: docs
            })
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: "Invalid id. Server error.",
                error: err.message
            })
        })
}

const update = async (req, res) => {
    const v = new Validator(req.body, {
        name: "required",
        minprice: "required",
        discount_type: "required",
        expdate: "required",
        // applicable_date:"required",
        times: "required",

    })

    let matched = await v.check().then((val) => val)
    if (!matched) {
        return res.status(400).send({
            status: false,
            error: v.errors
        })
    }

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
    var id = req.params.id;

    return Coupon.findOneAndDelete({ _id: mongoose.Types.ObjectId(id) })
        .then((docs) => {
            return res.status(200).json({
                status: true,
                message: 'Coupon delete successfully',
                data: docs
            });
        })
        .catch((err) => {
            res.status(500).json({
                status: false,
                message: 'Invalid id. Server error.',
                error: err.message,
            });
        })
}

module.exports = {
    create,
    viewAll,
    viewById,
    update,
    Delete
}