var mongoose = require('mongoose');
const { Validator } = require('node-input-validator');

const USER_ADDRESSES = require('../../Models/user_address');

var saveAddress = async (req, res) => {
    if (req.body.future_use != "" || req.body.future_use != null || typeof req.body.future_use != "undefined") {
        let adminCheck = await USER_ADDRESSES.findOne(
            {
                userid: mongoose.Types.ObjectId(req.body.userid),
                future_use: true
            }
        ).exec();

        if (adminCheck == null) {
            const V = new Validator(req.body, {
                address1: "required",
                state: "required",
                country: "required",
                zip: "required"
            });
            let matched = await V.check().then(val => val);

            if (!matched) {
                return res.status(400).json({ status: false, errors: V.errors });
            }

            let saveData = {
                _id: mongoose.Types.ObjectId(),
                userid: mongoose.Types.ObjectId(req.body.userid),
                address1: req.body.address1,
                state: req.body.state,
                country: req.body.country,
                zip: req.body.zip,
                future_use: req.body.future_use
            }
            if (req.body.address2 != "" || req.body.address2 != null || typeof req.body.address2 != "undefined") {
                saveData.address2 = req.body.address2;
            }
            if (req.body.shipping != "" || req.body.shipping != null || typeof req.body.shipping != "undefined") {
                saveData.shipping = req.body.shipping;
            }
            if (req.body.address_type != "" || req.body.address_type != null || typeof req.body.address_type != "undefined") {
                saveData.address_type = req.body.address_type;
            }

            const NEW_ADDRESS = new USER_ADDRESSES(saveData);
            return NEW_ADDRESS.save()
                .then(docs => {
                    res.status(200).json({
                        status: true,
                        message: "Address saved successfully.",
                        data: docs
                    });
                })
                .catch(err => {
                    res.status(500).json({
                        status: false,
                        message: "Failed to save address. Server error.",
                        error: err.message
                    });
                });
        }
        else {
            adminCheck.delete();

            const V = new Validator(req.body, {
                address1: "required",
                state: "required",
                country: "required",
                zip: "required"
            });
            let matched = await V.check().then(val => val);

            if (!matched) {
                return res.status(400).json({ status: false, errors: V.errors });
            }

            let saveData = {
                _id: mongoose.Types.ObjectId(),
                userid: mongoose.Types.ObjectId(req.body.userid),
                address1: req.body.address1,
                state: req.body.state,
                country: req.body.country,
                zip: req.body.zip,
                future_use: req.body.future_use
            }
            if (req.body.address2 != "" || req.body.address2 != null || typeof req.body.address2 != "undefined") {
                saveData.address2 = req.body.address2;
            }
            if (req.body.shipping != "" || req.body.shipping != null || typeof req.body.shipping != "undefined") {
                saveData.shipping = req.body.shipping;
            }
            if (req.body.address_type != "" || req.body.address_type != null || typeof req.body.address_type != "undefined") {
                saveData.address_type = req.body.address_type;
            }

            const NEW_ADDRESS = new USER_ADDRESSES(saveData);
            return NEW_ADDRESS.save()
                .then(docs => {
                    res.status(200).json({
                        status: true,
                        message: "Address saved successfully.",
                        data: docs
                    });
                })
                .catch(err => {
                    res.status(500).json({
                        status: false,
                        message: "Failed to save address. Server error.",
                        error: err.message
                    });
                });
        }
    }
    else {
        const V = new Validator(req.body, {
            address1: "required",
            state: "required",
            country: "required",
            zip: "required"
        });
        let matched = await V.check().then(val => val);

        if (!matched) {
            return res.status(400).json({ status: false, errors: V.errors });
        }

        let saveData = {
            _id: mongoose.Types.ObjectId(),
            userid: mongoose.Types.ObjectId(req.body.userid),
            address1: req.body.address1,
            state: req.body.state,
            country: req.body.country,
            zip: req.body.zip
        }
        if (req.body.address2 != "" || req.body.address2 != null || typeof req.body.address2 != "undefined") {
            saveData.address2 = req.body.address2;
        }
        if (req.body.shipping != "" || req.body.shipping != null || typeof req.body.shipping != "undefined") {
            saveData.shipping = req.body.shipping;
        }
        if (req.body.address_type != "" || req.body.address_type != null || typeof req.body.address_type != "undefined") {
            saveData.address_type = req.body.address_type;
        }

        const NEW_ADDRESS = new USER_ADDRESSES(saveData);
        return NEW_ADDRESS.save()
            .then(docs => {
                res.status(200).json({
                    status: true,
                    message: "Address saved successfully.",
                    data: docs
                });
            })
            .catch(err => {
                res.status(500).json({
                    status: false,
                    message: "Failed to save address. Server error.",
                    error: err.message
                });
            });
    }
}

var getAddressForFutureUse = async (req, res) => {
    let adminCheck = await USER_ADDRESSES.findOne(
        {
            userid: mongoose.Types.ObjectId(req.body.userid),
            future_use: true
        }
    ).exec();

    if (adminCheck == null) {
        return res.status(200).json({
            status: true,
            message: "User has not kept an address for future use.",
            data: []
        });
    }
    else {
        return res.status(200).json({
            status: true,
            message: "Data successfully get.",
            data: adminCheck
        });
    }
}

module.exports = {
    saveAddress,
    getAddressForFutureUse
}