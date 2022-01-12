var mongoose = require('mongoose');

const { Validator } = require('node-input-validator');

var ContactUs = require("../../Models/seller_contactus");
const USER_GRIEVANCE = require('../../Models/user_grievance');
const EMAIL_SEND = require('../../service/emailsend');

const sellerContactUsInfo = async (req, res) => {
    const v = new Validator(req.body, {
        name: "required",
        email: "required",
        // cat_id : "required",
        message: "required"

    })

    let matched = await v.check().then((val) => val)
    if (!matched) {
        return res.status(200).send({
            status: false,
            error: v.errors
        })
    }

    let contactus = {
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        email: req.body.email,
        // cat_id : req.body.cat_id,
        message: req.body.message

    }

    const contactSave = await new ContactUs(contactus)

    return contactSave
        .save()
        .then((data) => {
            EMAIL_SEND.grievance(data.email);

            res.status(200).json({
                status: true,
                data: data,
                message: "Info saved successfully"
            })
        })
        .catch((err) => {
            res.status(500).json({
                status: false,
                message: "error. Please try again.",
                error: err,
            });
        })
}

var userContactUsInfo = async (req, res) => {
    const V = new Validator(req.body, {
        user_type: 'required',
        email: 'required',
        question: 'required',
        grievance: 'required'
    });
    let matched = await V.check().then(val => val);

    if (!matched) {
        return res.status(400).json({ status: false, errors: V.errors });
    }

    const NEW_GRIEVANCE = new USER_GRIEVANCE(req.body);

    return NEW_GRIEVANCE.save()
        .then(data => {
            console.log("email", data.email);

            EMAIL_SEND.grievance(data.email);

            res.status(200).json({
                status: true,
                message: "Data saved successfully!",
                data: data
            });
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: "Failed to save data. Server error.",
                error: err.message
            });
        });
}

module.exports = {
    sellerContactUsInfo,
    userContactUsInfo
}
