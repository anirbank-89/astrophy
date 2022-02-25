var mongoose = require('mongoose');
var passwordHash = require('password-hash');
var jwt = require('jsonwebtoken');
var Shop = require('../../Models/shop');
var User = require('../../Models/user');
var Upload = require("../../service/upload");

const { Validator } = require('node-input-validator');

const createNUpdate = async (req, res) => {
    const v = new Validator(req.body, {
        name: 'required',
        title: 'required',
        description: 'required'
    });
    let matched = await v.check().then((val) => val)
    if (!matched) {
        res.status(200).send({ status: false, error: v.errors });
    }

    console.log(req.body);
    // return false;
    let shopData = await Shop.find({ userid: { $in: [mongoose.Types.ObjectId(req.body.userid)] } }).exec();
    console.log(shopData.length)
    // return false;
    //   .then((data)=>{
    if (shopData.length == 0) {
        //bn
        //   if (typeof(req.files)=='undefined' || req.files == null) {
        if (Object.keys(req.files).length === 0) {
            return res.status(200).send({
                status: true,
                error: {
                    "images": {
                        "message": "The image fields are mandatory.",
                        "rule": "required"
                    }
                }
            });
        }

        let shopData = {
            _id: mongoose.Types.ObjectId(),
            banner_img: "uploads/shop_services/" + "banner_" + req.files.file1[0].originalname,// +Math.floor(100000+(Math.random()*900000))+"_"+Date.now()+"_"
            shop_img: "uploads/shop_services/" + "shop_" + req.files.file2[0].originalname,// +Math.floor(100000+(Math.random()*900000))+"_"+Date.now()+"_"
            name: req.body.name,
            title: req.body.title,
            description: req.body.description,
            userid: mongoose.Types.ObjectId(req.body.userid)
        }
        if (req.body.tags != '' || req.body.tags != null) {
            shopData.tags = req.body.tags;
        }
        if (req.body.personalization != '' || req.body.personalization != null) {
            shopData.personalization = req.body.personalization;
        }
        const shop_owner = new Shop(shopData)

        shop_owner.save().then((docs) => {
            res.status(200).json({
                status: true,
                success: true,
                message: "New shop successfully created",
                data: docs
            });
        })
            .catch((err) => {
                res.status(500).json({
                    status: false,
                    message: "Server error. Please try again",
                    error: err
                });
            });
    }
    else {
        //b
        //   console.log(req.files)
        //   if(Object.keys(req.files).length === 0 )
        //   {
        //     console.log("ok")
        //   }
        //   else
        //   {
        //     console.log("notok")
        //   }
        //   return false;
        let updateObj = {
            name: req.body.name,
            title: req.body.title,
            tags: req.body.tags,
            description: req.body.description,
            personalization: req.body.personalization,
            userid: req.body.userid
        }
        if (typeof req.files.file1 != 'undefined' && req.files.file1.length > 0) {
            updateObj.banner_img = "uploads/shop_services/" + "banner_" + req.files.file1[0].originalname
        }

        if (typeof req.files.file2 != 'undefined' && req.files.file2.length > 0) {
            updateObj.shop_img = "uploads/shop_services/" + "shop_" + req.files.file2[0].originalname
        }
        Shop.findOneAndUpdate(
            { userid: { $in: [mongoose.Types.ObjectId(req.body.userid)] } },
            updateObj,
            // req.body,
            async (err, docs) => {
                if (err) {
                    res.status(500).json({
                        status: false,
                        message: "Server error. Please try again.",
                        error: err
                    });
                }
                else {
                    res.status(200).json({
                        status: true,
                        message: "Shop data updated successfully!",
                        data: await docs
                    });
                }
            }
        )
    }
    //   })
    //   .catch((err)=>{
    //       res.status(500).json({
    //           status: false,
    //           message: "Server error. Please provide images"
    //       });
    //   });
}

const viewAllShops = async (req, res) => {
    return Shop.aggregate(
        [
            {
                $lookup: {
                    from: "users",
                    localField: "userid",
                    foreignField: "_id",
                    as: "seller_data"
                }
            },
            {
                $project: {
                    _v: 0
                }
            }
        ]
    )
        .then((data) => {
            res.status(200).json({
                status: true,
                message: "Shops get successfully",
                data: data
            });
        })
        .catch((err) => {
            res.status(500).json({
                status: false,
                message: "Server error. Please try again.",
                error: err
            });
        });
}

const viewShop = async (req, res) => {
    let id = req.params.id
    let shop = await Shop.findOne({ userid: mongoose.Types.ObjectId(id) }).exec();

    if (shop == null) {
        return res.status(500).json({
            status: false,
            message: "No shop.",
            data: null
        })
    }
    else {
        return res.status(200).json({
            status: true,
            message: "Data get successfully.",
            data: shop
        })
    }
}

module.exports = {
    createNUpdate,
    viewAllShops,
    viewShop
}