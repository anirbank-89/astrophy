const WITHDRAWS = require('../../Models/withdraw');
const PRODUCT_REFUND = require

var clearPayment = async (req,res) => {
    return WITHDRAWS.updateMany(
        { paystatus: false },
        { $set: { paystatus: true }} ,
        { multi: true },
        (err,result) => {
            if (!err) {
                console.log("Scheduled payments completed.");
            }
            else {
                console.log("Failed to execute payments due to: ", err.message);
            }
        }
    );
}

var clearProductRefunds = async (req,res) => {
    return PRODUCT_REFUND.updateMany(
        { refund_status: false }, 
        { $set: { refund_status: true } }, 
        { multi: true }, 
        (err,result) => {
            if (!err) {
                console.log("Product refunds cleared.");
            }
            else {
                console.log("Failed to clear product refunds due to: ", err.message);
            }
        }
    )
}

module.exports = {
    clearPayment,
    clearProductRefunds
}