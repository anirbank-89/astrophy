var mongoose = require('mongoose')
var passwordHash = require('password-hash');
var jwt = require('jsonwebtoken');
const { Validator } = require('node-input-validator');

// var Admin = require('../../Models/admin');
var RefundPersonnel = require('../../Models/refund_personnel');
var Upload = require('../../service/upload');

function createToken(data) {
    return jwt.sign(data, 'DonateSmile');
}

const getTokenData = async (token) => {
    let adminData = await RefundPersonnel.findOne({ token: token }).exec();
    // console.log('adminData', adminData);
    return adminData;
}

const register = async (req, res) => {
    if (req.file == "" || req.file == null || typeof req.file == "undefined") {
        return res.status(400).send({
            status: false,
            error: {
                "image": {
                    "message": "The image field is mandatory.",
                    "rule": "required"
                }
            }
        });
    }

    let imageUrl = await Upload.uploadFile(req, "refund_personnel");

    let adminData = {
        _id: mongoose.Types.ObjectId(),
        fullname: req.body.fullname,
        email: req.body.email,
        password: passwordHash.generate(req.body.password),
        image: imageUrl,
        token: createToken(req.body)
    }
    if (typeof (req.body.mobile) != 'undefined') {
        adminData.mobile = req.body.mobile
    }

    const admin = new RefundPersonnel(adminData)

    return admin.save().then((data) => {
        res.status(200).json({
            status: true,
            success: true,
            message: 'New refund personnel created successfully',
            data: data,
        })
    })
        .catch((error) => {
            res.status(200).json({
                status: false,
                success: false,
                message: 'Server error. Please try again.',
                error: error,
            });
        })
}

var refundPersonnelList = async (req,res) => {
    let refundPersonnel = await RefundPersonnel.find({ status: true }).exec();

    if (refundPersonnel.length > 0) {
        return res.status(200).json({
            status: true,
            message: "Data successfully get.",
            data: refundPersonnel
        });
    }
    else {
        return res.status(200).json({
            status: true,
            message: "Currently no active personnel exists.",
            data: []
        });
    }
}

var setStatus = async (req,res) => {
    var id = req.params.id;

    return RefundPersonnel.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(id) }, 
        { $set: { status: false } }, 
        { new: true }
        )
        .then(data => {
            res.status(200).json({
                status: true,
                message: "Personnel made inactive",
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
    getTokenData,
    register,
    refundPersonnelList,
    setStatus
}