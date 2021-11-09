var mongoose = require('mongoose');
const { Validator } = require('node-input-validator');

const MAIL_SUBSCRIPTION = require('../../Models/mail_subscription');

var subscribe = async (req, res) => {
    const V = new Validator(req.body, {
        email: 'required'
    });
    let matched = V.check().then(val => val);

    if (!matched) {
        return res.status(400).json({ status: false, errors: V.errors });
    }
    var check_email = await MAIL_SUBSCRIPTION.find({
        email: req.body.email
    }).exec();

    if (check_email.length > 0) {
        console.log("Mail subscription status: ", check_email[0].status);

        if (check_email[0].status == true) {
            return res.status(500).json({
                status: false,
                error: "Email already subscribed.",
                data: null
            });
        }
        else {
            return MAIL_SUBSCRIPTION.findOneAndUpdate(
                { email: req.body.email },
                { $set: { status: true } },
                { new: true },
                (err, docs) => {
                    if (!err) {
                        res.status(200).json({
                            status: true,
                            message: "Subscribed successfully!",
                            data: docs
                        });
                    }
                    else {
                        res.status(500).json({
                            status: false,
                            message: "Failed to subscribe. Server error.",
                            error: err.message
                        });
                    }
                }
            );
        }
    }
    else {
        let saveData = {
            _id: mongoose.Types.ObjectId(),
            email: req.body.email
        }

        const NEW_MAIL_SUBSCRIPTION = new MAIL_SUBSCRIPTION(saveData);

        return NEW_MAIL_SUBSCRIPTION.save((err, docs) => {
            if (!err) {
                res.status(200).json({
                    status: true,
                    message: "Subscribed successfully!",
                    data: docs
                });
            }
            else {
                res.status(500).json({
                    status: false,
                    message: "Failed to subscribe. Server error.",
                    error: err.message
                });
            }
        });
    }
}

var unsubscribe = async (req, res) => {
    return MAIL_SUBSCRIPTION.findOneAndUpdate(
        { email: req.body.email },
        { $set: { status: false } },
        { new: true },
        (err, docs) => {
            if (!err) {
                res.status(200).json({
                    status: true,
                    message: "Unsubscribed successfully!",
                    data: docs
                });
            }
            else {
                res.status(500).json({
                    status: false,
                    message: "Failed to unsubscribe. Server error.",
                    error: err.message
                });
            }
        }
    );
}

module.exports = {
    subscribe,
    unsubscribe
}