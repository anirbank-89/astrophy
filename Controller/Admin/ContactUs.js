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

var getContactusInfo2 = async (req,res) => {
    return USER_QUERIES.aggregate([
        {
            $project: {
                __v: 0
            }
        }
    ])
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

var getContactusInfoById=async(req,res)=>{
    var id = req.params.id;

    return USER_QUERIES.findOne({ _id: mongoose.Types.ObjectId(id) })
        .then(docs => {
            res.status(200).json({
                status: true,
                message: "Data get successfully.",
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

var replyToMessage = async (req,res) => {
    var id = req.params.id;

    const V = new Validator(req.body, {
        reply: "required"
    });
    let matched = await V.check().then(val => val);

    if (!matched) {
        return res.status(400).json({ status: false, error: V.errors });
    }

    return USER_QUERIES.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(id) }, 
        req.body,
        { new: true }
    )
        .then(docs => {
            console.log(docs);
            emailSend.replyToContact(docs.reply,docs.email);

            res.status(200).json({
                status: true,
                message: "Reply successfully sent.",
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

module.exports = {
    getContactusInfo,
    getContactusInfo2,
    getContactusInfoById,
    replyToMessage
}