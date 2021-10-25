var mongoose = require('mongoose');
var User = require("../../Models/user");
var passwordHash = require('password-hash')

var jwt = require('jsonwebtoken');

const { Validator } = require('node-input-validator');

var uuidv1 = require('uuid').v1;

const viewUserList = async (req, res) => {
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
    return User.find(
        { type: { $in: "Seller" } },
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
                    message: "Sellers get successfully",
                    data: docs
                });
            }
        }).sort({ _id: 'desc' });
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

module.exports = {
    viewUserList,
    viewUser,
    viewSellerList,
    viewSeller,
    setStatus,
    setBlock
}