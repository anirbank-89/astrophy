const SELLER_COMMISSIONS = require('../../Models/servicecommission');
const WITHDRAWS = require('../../Models/withdraw');
const PRODUCT_REFUND = require('../../Models/product_refund');
const SERVICE_REFUND = require('../../Models/service_refund');


var payForServiceOrNot = async (req,res) => {
    return SELLER_COMMISSIONS.updateMany(
        {
            status: false, 
            refund: false
        }, 
        { $set: { status: true } }, 
        { multi: true }, 
        (err,result) => {
            if (!err) {
                console.log("Newly completed and not refunded seller commissions cleared.");
            }
            else {
                console.log("Failed to execute required clearance due to ", err.message);
            }
        }
    );
}

var payForService = async (req,res) => {
    return SELLER_COMMISSIONS.updateMany(
        {
            status: true, 
            sellerapply: true
        },
        { $set: { paystatus: true } },
        { multi: true }, 
        (err,result) => {
            if (!err) {
                console.log("Seller claimed commissions cleared.");
            }
            else {
                console.log("Failed to execute required clearance due to ", err.message);
            }
        }
    );
}

var clearPayment = async (req, res) => {
    return WITHDRAWS.updateMany(
        { paystatus: false },
        { $set: { paystatus: true } },
        { multi: true },
        (err, result) => {
            if (!err) {
                console.log("Scheduled payments completed.");
            }
            else {
                console.log("Failed to execute payments due to: ", err.message);
            }
        }
    );
}

var clearProductRefunds = async (req, res) => {
    return PRODUCT_REFUND.updateMany(
        { refund_status: false },
        { $set: { refund_status: true } },
        { multi: true },
        (err, result) => {
            if (!err) {
                console.log("Product refunds cleared.");
            }
            else {
                console.log("Failed to clear product refunds due to: ", err.message);
            }
        }
    );
}

var clearServiceRefunds = async (req, res) => {
    return SERVICE_REFUND.updateMany(
        { refund_status: false }, 
        { $set: { refund_status: true } },
        { multi: true },
        (err, result) => {
            if (!err) {
                console.log("Product refunds cleared.");
            }
            else {
                console.log("Failed to clear product refunds due to: ", err.message);
            }
        }
    );
}

module.exports = {
    payForServiceOrNot,
    payForService,
    clearPayment,
    clearProductRefunds,
    clearServiceRefunds
}