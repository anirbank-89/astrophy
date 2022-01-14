const WITHDRAWS = require('../../Models/withdraw');

var clearPayment = async (req,res) => {
    return WITHDRAWS.updateMany(
        { paystatus: false },
        { $set: { paystatus: true }},
        { multi: true },
        (err, result) => {
            if (!err) {
                console.log("ScheduledPayments completed.");
            }
            else {
                console.log("Failed to execute payments due to: ", err.message);
            }
        }
    );
}

module.exports = {
    clearPayment
}