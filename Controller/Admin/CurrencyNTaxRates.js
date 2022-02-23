var mongoose = require('mongoose');

const { Validator } = require('node-input-validator');

const CURRENCY = require('../../Models/currency');

// Add currency and tax rate in single information doc
var addCurrencyNTax = async (req, res) => {
    const V = new Validator({
        name: 'required',
        abbreviation: 'required',
        tax_rate: 'required'
    });
    let matched = await V.check().then(val => val);

    if (!matched) {
        return res.status(400).json({ status: false, errors: V.errors });
    }

    let saveData = {
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        abbreviation: req.body.abbreviation,
        tax_rate: req.body.tax_rate
    }
    if (req.body.symbol != null || req.body.symbol != "" || typeof req.body.symbol != "undefined") {
        saveData.symbol = req.body.symbol;
    }
    if (req.body.subunit != null || req.body.subunit != "" || typeof req.body.subunit != "undefined") {
        saveData.subunit = req.body.subunit;
    }
    if (req.body.detailed_info != null || req.body.detailed_info != "" || typeof req.body.detailed_info != "undefined") {
        saveData.detailed_info = req.body.detailed_info;
    }

    const NEW_CURRENCY = new CURRENCY(saveData);

    return NEW_CURRENCY.save()
        .then(docs => {
            res.status(200).json({
                status: true,
                message: "Data saved successfully.",
                data: docs
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

var getCurrencies = async (req, res) => {
    return CURRENCY.find({})
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
                message: "Failed to get data. Server error.",
                error: err.message
            });
        });
}

var getCurrenciesById = async (req, res) => {
    var id = req.params.id;

    return CURRENCY.findOne({ _id: mongoose.Types.ObjectId(id) })
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

var editCurrency = async (req, res) => {
    var id = req.params.id;

    const V = new Validator({
        name: 'required',
        abbreviation: 'required',
        tax_rate: 'required'
    });
    let matched = await V.check().then(val => val);

    if (!matched) {
        return res.status(400).json({ status: false, errors: V.errors });
    }

    return CURRENCY.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(id) }, 
        req.body,
        { new: true }
    )
        .then(docs => {
            res.status(200).json({
                status: true,
                message: "Data successfully edited.",
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

var getTaxRateByCurrency = async (req, res) => {
    return CURRENCY.findOne({ abbreviation: req.body.currency })
        .then(docs => {
            res.status(200).json({
                status: true,
                message: "Data successfully get.",
                data: docs
            });
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: "Failed to get data. Server error.",
                error: err
            });
        });
}

var deleteCurrency = async (req, res) => {
    var id = req.params.id;

    return CURRENCY.findOneAndDelete({ _id: mongoose.Types.ObjectId(id) })
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

module.exports = {
    addCurrencyNTax,
    getCurrencies,
    getCurrenciesById,
    editCurrency,
    getTaxRateByCurrency,
    deleteCurrency
}