var mongoose = require('mongoose');
const { Validator } = require('node-input-validator');

var ContactUs = require("../../Models/seller_contactus");
const USER_QUERIES = require('../../Models/user_queries');
var emailSend = require('../../service/emailsend');

var getContactusInfo = async (req, res) => {
    return ContactUs.aggregate([
        {
            $project: {
                _v: 0,
            },
        },
    ])
        .then((docs) => {
            res.status(200).json({
                status: true,
                message: "Contactus Info get successfully",
                data: docs,
            });
        })
        .catch((err) => {
            res.status(500).json({
                status: false,
                message: "Server error. Please try again.",
                error: err.message,
            });
        });
}

var getContactusInfo2 = async (req, res) => {
    if (req.body.user_category == "") {
        return USER_QUERIES.find({})
            .then(data => {
                if (data.length > 0) {
                    res.status(200).json({
                        status: true,
                        message: "Data successfully get.",
                        data: data
                    });
                }
                else {
                    res.status(200).json({
                        status: true,
                        message: "No user queries.",
                        data: []
                    });
                }
            })
            .catch(err => {
                res.status(500).json({
                    status: false,
                    message: "Failed to get data. Server error.",
                    error: err.message
                });
            });
    }
    else if (req.body.user_category == "User") {
        return USER_QUERIES.find({ user_category: "User" })
            .then(data => {
                if (data.length > 0) {
                    res.status(200).json({
                        status: true,
                        message: "Data successfully get.",
                        data: data
                    });
                }
                else {
                    res.status(200).json({
                        status: true,
                        message: "No user queries.",
                        data: []
                    });
                }
            })
            .catch(err => {
                res.status(500).json({
                    status: false,
                    message: "Failed to get data. Server error.",
                    error: err.message
                });
            });
    }
    else if (req.body.user_category == "Seller") {
        return USER_QUERIES.find({ user_category: "Seller" })
            .then(data => {
                if (data.length > 0) {
                    res.status(200).json({
                        status: true,
                        message: "Data successfully get.",
                        data: data
                    });
                }
                else {
                    res.status(200).json({
                        status: true,
                        message: "No user queries.",
                        data: []
                    });
                }
            })
            .catch(err => {
                res.status(500).json({
                    status: false,
                    message: "Failed to get data. Server error.",
                    error: err.message
                });
            });
    }
}

var getContactusInfoById = async (req, res) => {
    var id = req.params.id;

    let sellerContacts = await ContactUs.findOne({ _id: mongoose.Types.ObjectId(id) }).exec();
    let userQueries = await USER_QUERIES.findOne({ _id: mongoose.Types.ObjectId(id) }).exec();

    if (sellerContacts != null && userQueries == null) {
        return res.status(200).json({
            status: true,
            message: "Data get successfully.",
            data: sellerContacts
        });
    }
    else if (sellerContacts == null && userQueries != null) {
        return res.status(200).json({
            status: true,
            message: "Data get successfully.",
            data: userQueries
        });
    }
    else {
        return res.status(500).json({
            status: false,
            error: "Invalid id. Server error.",
            data: null
        });
    }
}

var replyToMessage = async (req, res) => {
    var id = req.params.id;

    const V = new Validator(req.body, {
        reply: "required"
    });
    let matched = await V.check().then(val => val);

    if (!matched) {
        return res.status(400).json({ status: false, error: V.errors });
    }

    let sellerContacts = await ContactUs.findOne({ _id: mongoose.Types.ObjectId(id) }).exec();
    let userQueries = await USER_QUERIES.findOne({ _id: mongoose.Types.ObjectId(id) }).exec();

    if (sellerContacts != null && userQueries == null) {
        return ContactUs.findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(id) },
            req.body,
            { new: true }
        )
            .then(docs => {
                res.status(200).json({
                    status: true,
                    message: "Replied successfully.",
                    data: docs
                })
            })
            .catch(err => {
                res.status(500).json({
                    status: false,
                    message: "Invalid id. Server error.",
                    error: err.message
                });
            });
    }
    else if (sellerContacts == null && userQueries != null) {
        return USER_QUERIES.findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(id) },
            req.body,
            { new: true }
        )
            .then(docs => {
                res.status(200).json({
                    status: true,
                    message: "Replied successfully.",
                    data: docs
                })
            })
            .catch(err => {
                res.status(500).json({
                    status: false,
                    message: "Invalid id. Server error.",
                    error: err.message
                });
            });
    }
}

module.exports = {
    getContactusInfo,
    getContactusInfo2,
    getContactusInfoById,
    replyToMessage
}