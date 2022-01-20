var mongoose = require('mongoose');
var passwordHash = require('password-hash');
const { Validator } = require('node-input-validator');

const REFUND_PERSONNEL = require('../../Models/refund_personnel');
var Upload = require('../../service/upload')

var getProfile = async (req, res) => {
    console.log(req.params.id)
    REFUND_PERSONNEL.findOne({ _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } })
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

// Admin update profile of user
const updateProfile = async (req, res) => {

    let editData = {
        fullname: req.body.fullname,
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
        let image_url = await Upload.uploadFile(req, "refund_personnel");
        editData.image = image_url;
    }

    var profile = await REFUND_PERSONNEL.findOne(
        { _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } }
    ).exec();

    if (profile != null || profile != "") {
        REFUND_PERSONNEL.findOneAndUpdate(
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
            REFUND_PERSONNEL.findOne({ _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } })
                .then(admin => {
                    // if old password value matched & return true from database
                    if (admin.comparePassword(req.body.old_password) === true) {
                        REFUND_PERSONNEL.findOneAndUpdate(
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

module.exports = {
    getProfile,
    updateProfile,
    updatePassword
}