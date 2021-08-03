var mongoose = require('mongoose');
var passwordHash = require('password-hash');
var jwt = require('jsonwebtoken');
var Shop = require('../../Models/shop');
var User = require('../../Models/user');
var Upload = require("../../service/upload");

const { Validator } = require('node-input-validator');

const createNUpdate = async (req,res)=>{
    const v = new Validator(req.body,{
        name: 'required',
        title: 'required',
        description: 'required'
    });
    let matched = await v.check().then((val)=>val)
    if(!matched){
        res.status(200).send({ status: false, error: v.errors });
    }
    console.log(req.files)
    console.log(req.body);
    
    Shop.find({userid: {$in: [mongoose.Types.ObjectId(req.body.userid)]}})
      .then((data)=>{
          if (data == null || data == '') {
              //bn
              if (typeof(req.files)=='undefined' || req.files == null) {
                return res.status(200).send({
                    status:true,
                    error:{
                        "images":{
                            "message": "The image fields are mandatory.",
                            "rule": "required"
                        }
                    }
                });
            }

            let shopData = {
                _id: mongoose.Types.ObjectId(),
                banner_img: "uploads/shop_banner_n_image/"+"banner_"+req.files.banner_img[0].originalname,// +Math.floor(100000+(Math.random()*900000))+"_"+Date.now()+"_"
                shop_img: "uploads/shop_banner_n_image/"+"shop_"+req.files.shop_img[0].originalname,// +Math.floor(100000+(Math.random()*900000))+"_"+Date.now()+"_"
                name: req.body.name,
                title: req.body.title,
                description: req.body.description,
                userid: mongoose.Types.ObjectId(req.body.userid)
            }
            if(req.body.tags != '' || req.body.tags != null){
                shopData.tags = req.body.tags;
            }
            if(req.body.personalization != '' || req.body.personalization != null){
                shopData.personalization = req.body.personalization;
            }
            const shop_owner = new Shop(shopData)
            
            shop_owner.save().then((docs)=>{
                res.status(200).json({
                    status: true,
                    success: true,
                    message: "New shop successfully created",
                    data: docs
                });
            })
            .catch((err)=>{
                res.status(500).json({
                    status: false,
                    message: "Server error. Please try again",
                    error: err
                });
            });
          }
          else {
              //b
            Shop.findOneAndUpdate(
                {userid: { $in : [mongoose.Types.ObjectId(req.body.userid)] } }, 
                {
                    name: req.body.name,
                    title: req.body.title,
                    tags: req.body.tags,
                    description: req.body.description,
                    personalization: req.body.personalization,
                    userid: req.body.userid
                },
                async (err,docs)=>{
                    if(err){
                        res.status(500).json({
                            status: false,
                            message: "Server error. Please try again.",
                            error: err
                        });
                    }
                    else{
                        res.status(200).json({
                            status: true,
                            message: "Shop data updated successfully!",
                            data: docs
                        });
                    }
                }
            )
          }
      })
      .catch((err)=>{
          res.status(500).json({
              status: false,
              message: "Server error. Please provide images"
          });
      });
}

const viewAllShops = async (req,res)=>{
    return Shop.aggregate(
        [
            {
                $lookup:{
                    from:"users",
                    localField:"userid",
                    foreignField:"_id",
                    as:"seller_data"
                }
            },
            {
                $project:{
                    _v:0
                }
            }
        ]
    )
    .then((data)=>{
        res.status(200).json({
            status: true,
            message: "Shops get successfully",
            data: data
        });
    })
    .catch((err)=>{
        res.status(500).json({
            status: false,
            message: "Server error. Please try again.",
            error: err
        });
    });
}

const viewShop = async (req,res)=>{
    let id = req.params.id
    return Shop.findOne(
        {userid: { $in : [mongoose.Types.ObjectId(id)] } }, 
        async (err,docs)=>{
            if(err){
                res.status(500).json({
                    status: false,
                    message: "Server error. Data not available",
                    error: err
                });
            }
            else{
                res.status(200).json({
                    status: true,
                    message: "Shop get successfully",
                    data: docs
                });
            }
        }
    )
}

module.exports = {
    createNUpdate,
    viewAllShops,
    viewShop
}