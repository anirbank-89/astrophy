var mongoose = require('mongoose');
var Shop = require('../../Models/shop');
var User = require('../../Models/user');
var passwordHash = require('password-hash');

var jwt = require('jsonwebtoken');
const { Validator } = require('node-input-validator');

const register = async (req,res)=>{
    const v = new Validator(req.body,{
        name: 'required',
        description: 'required',
        phone:'required',
        email:'required|email'
    });
    let matched = v.check().then((val)=>val)
    if(!matched){
        res.status(200).send({ status: false, error: v.errors });
    }
    
    Shop.findOne({userid: { $in : [mongoose.Types.ObjectId(req.body.user_id)] } })
      .then(data =>{
          if(data!=null && data!=''){
            return res.status(401).json({
                status: false,
                message: 'User already registered as a shop owner',
            });
          }
          else{
            let shopData = {
                _id: mongoose.Types.ObjectId(),
                name: req.body.name,
                description: req.body.description,
                phone: req.body.phone,
                email: req.body.email,
                userid: mongoose.Types.ObjectId(req.body.user_id)
            }
            if(typeof(req.body.address) != '' && typeof(req.body.address) != null){
                shopData.address = req.body.address
            }
            const shop_owner = new Shop(shopData)

            shop_owner.save().then((docs)=>{
                res.status(200).json({
                    status: true,
                    success: true,
                    message: "New shop successfully created",
                    data: docs
                });
            });
          }
      })
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
    return Shop.findOne(
        {_id: { $in : [mongoose.Types.ObjectId(req.params.id)] } }, 
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

const editShop = async (req,res)=>{
    const v = new Validator(req.body,{
        name: 'required',
        description: 'required',
        phone:'required',
        email:'required|email'
    });
    let matched = v.check().then((val)=>val);
    if(!matched){
        res.status(200).send({status: false, error: v.errors});
    }

    Shop.findOneAndUpdate(
        {userid: { $in : [mongoose.Types.ObjectId(req.body.user_id)] } }, 
        req.body,
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

const deleteShop = async (req,res)=>{
    Shop.findOne(
        {userid: { $in : [mongoose.Types.ObjectId(req.body.user_id)] } }, 
    ).then((docs)=>{
        if(docs!=null && docs!=''){
            Shop.remove({_id: { $in : [mongoose.Types.ObjectId(req.params.id)]}})
              .then((data)=>{
                  res.status(200).json({
                      status: true,
                      message: "Shop deleted successfully",
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
        else{
            res.status(200).json({
                status: false,
                message: "This shop isn't active anymore."
            });
        }
    }).catch((err)=>{
        res.status(500).json({
            status: false,
            message: "Server error. Please try again.",
            error: err
        });
    });
}

module.exports = {
    register,
    viewAllShops,
    viewShop,
    editShop,
    deleteShop
}