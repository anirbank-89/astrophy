var mongoose = require('mongoose');

const { Validator } = require('node-input-validator');

var ContactUs = require("../../Models/seller_contactus");
const USER_QUERIES = require('../../Models/user_queries');
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
        question: 'required'
    });
    let matched = await V.check().then(val => val);

    if (!matched) {
        return res.status(400).json({ status: false, errors: V.errors });
    }

    const NEW_GRIEVANCE = new USER_QUERIES(req.body);

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

var getUserQueries = async (req,res) => {
    let queries = await USER_QUERIES.find({}).exec();

    if (queries.length > 0) {
        return res.status(200).json({
            status: true,
            message: "Data successfully get.",
            data: queries
        });
    }
    else {
        return res.status(200).json({
            status: true,
            message: "No unresolved queries.",
            data: []
        });
    }
}

module.exports = {
    sellerContactUsInfo,
    userContactUsInfo,
    getUserQueries
}
