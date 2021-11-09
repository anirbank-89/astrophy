const MAIL_SUBSCRIPTION = require('../../Models/mail_subscription');

var viewAllMailSubscrReq = async (req, res) => {
    var mail_subscr_req = await MAIL_SUBSCRIPTION.find({ status: true }).exec();

    if (mail_subscr_req.length > 0) {
        return res.status(200).json({
            status: true,
            message: "Data successfully get.",
            data: mail_subscr_req
        });
    }
    else {
        return res.status(200).json({
            status: true,
            message: "No mail subscriptions.",
            data: null
        });
    }
}

var viewAllMailUnsubscr = async (req, res) => {
    var mail_unsubscr_req = await MAIL_SUBSCRIPTION.find({ status: false }).exec();

    if (mail_unsubscr_req.length > 0) {
        return res.status(200).json({
            status: true,
            message: "Data successfully get.",
            data: mail_unsubscr_req
        });
    }
    else {
        return res.status(200).json({
            status: true,
            message: "No mail subscriptions.",
            data: null
        });
    }
}

module.exports = {
    viewAllMailSubscrReq,
    viewAllMailUnsubscr,
}