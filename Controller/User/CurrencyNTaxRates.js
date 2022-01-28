const CURRENCY = require('../../Models/currency');

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

var getTaxRateByCurrency = async (req,res) => {
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

module.exports = {
    getCurrencies,
    getTaxRateByCurrency
}