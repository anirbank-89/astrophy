var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const TOTAL_SERVICECOMISSION_REFUND = new Schema({
    seller_id: mongoose.Schema.Types.ObjectId,
    total_refunded: Number
});

module.exports = mongoose.model("total_service_commission_refund", TOTAL_SERVICECOMISSION_REFUND);