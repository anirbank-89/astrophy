var mongoose = require('mongoose')
const { Validator } = require('node-input-validator')

var ShopService = require('../../Models/shop_service')

var Upload = require('../../service/upload')

var chatServiceregister = async (req, res) => {
    const v = new Validator(req.body, {
        name: "required",
        details: "required",
        currency: "required",
        price: "required"
    })
    let matched = v.check().then((val) => val)
    if (!matched) {
        res.status(400).json({ status: false, errors: v.errors })
    }
    console.log(req.file)
    let image_url = await Upload.uploadFile(req, "shop_services")
    let shopServiceData = {
        _id: mongoose.Types.ObjectId(),
        shop_id: mongoose.Types.ObjectId(req.body.shop_id),
        seller_id: mongoose.Types.ObjectId(req.body.seller_id),
        name: req.body.name,
        price: req.body.price,
        details: req.body.details,
        currency: req.body.currency,
        price: req.body.price,
        chataddstatus: true
    }
    if (typeof (req.body.personalization) != 'undefined' || req.body.personalization != '') {
        shopServiceData.personalization = req.body.personalization
    }
    if (typeof (req.body.hashtags) != 'undefined' || req.body.hashtags != '') {
        shopServiceData.hashtags = req.body.hashtags
    }
    if (typeof (req.file) != 'undefined' || req.file != '' || req.file != null) {
        shopServiceData.image = image_url
    }

    let shop_service = new ShopService(shopServiceData)
    shop_service.save()
        .then((docs) => {
            res.status(200).json({
                status: true,
                message: "Shop's service created sucessfully!",
                data: docs
            })
        })
        .catch((err) => {
            res.status(500).json({
                status: false,
                message: "Server error. Please try again",
                errors: err
            })
        })
}

var chatImageUrl = async (req, res) => {
    let imagUrl = '';
    let image_url = await Upload.uploadFile(req, "chat")
    if (typeof (req.file) != 'undefined' || req.file != '' || req.file != null) {
        imagUrl = image_url
    }

    return res.status(200).send({
        status: true,
        data: imagUrl,
        error: null
    })
}

var getChatServById = async (req, res) => {
    var id = req.params.id;

    return ShopService.findOne({ _id: mongoose.Types.ObjectId(id) })
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

var userAccept = async (req, res) => {
    var id = req.params.id;

    return ShopService.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: { chataddaccept: true } },
        { new: true }
    )
        .then(docs => {
            res.status(200).json({
                status: true,
                message: "Data edited successfully.",
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
    chatServiceregister,
    chatImageUrl,
    getChatServById,
    userAccept
}