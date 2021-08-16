var mongoose = require('mongoose');
var User = require('../../Models/user');
var Product = require('../../Models/product');
var passwordHash = require('password-hash');

var jwt = require('jsonwebtoken');
const { Validator } = require('node-input-validator');

function createToken(data) {
    return jwt.sign(data, 'DonateSmile');
}

const getTokenData = async (token) => {
    let userData = await User.findOne({ token: token }).exec();
    // console.log('adminData', adminData);
    return userData;
}

const register = async(req,res)=>{
    const v = new Validator(req.body,{
        email:'required|email',
        password:'required|minLength:8',
        firstName:'required',
        lastName: 'required'
    })
    let matched = await v.check().then((val)=>val)
    if(!matched)
    {
        return res.status(200).send({ status: false, error: v.errors });
    }
    let userData = {
        _id:mongoose.Types.ObjectId(),
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email,
        password:passwordHash.generate(req.body.password),
        token:createToken(req.body)
    }
    // if (typeof (req.body.phone) !='undefined')
    // {
    //     userData.phone = Number(req.body.phone)
    // }

    const all_users = new User(userData)

    return all_users.save().then((data)=>{
        res.status(200).json({
            status: true,
            success: true,
            message: 'New user created successfully',
            data: data,
        })
    })
    .catch((error)=>{
        res.status(200).json({
            status: false,
            success: false,
            message: 'Server error. Please try again.',
            error: error,
        });
    });
}

// const signup = async (req,res)=>{}

const login = async(req,res) =>
{
    let v = new Validator(req.body,{
        email:'required|email',
        password:'required|minLength:8'
    })
    let matched = await v.check().then((val)=>val)
    if(!matched)
    {
        return res.status(401).json({
            status:false,
            error: v.errors
        });
    }

    User.findOne({email:req.body.email})
          .then(user =>{
                if(user!=null && user!='' && user.length < 1 )
                {
                    return res.status(401).json({
                            status: false,
                            message: 'Server error. Please try again.',
                            error: 'Server Error',
                        });
                }
                if(user!=null && user!='' && user.comparePassword(req.body.password))
                {
                    return res.status(200).json({
                        status: true,
                        message: 'Successfully logged in',
                        data: user
                    });
                }
                else
                {
                    return res.status(200).json({
                        status: false,
                        message: 'Server error. Please try again.',
                        error: 'Server Error',
                    });
                }
            }

          )
}

const viewProductList = async( req ,res )=>
{
    return Product.aggregate(
        [
            {
                $lookup:{
                    from:"categories",
                    localField:"catID",
                    foreignField: "_id",
                    as:"category_data"
                }
            },
            {
                $lookup:{
                    from:"reviews",
                    localField:"_id",
                    foreignField: "product_id",
                    as:"review_data",
                }
            },
            {
                $group: {
                  avgRating: { $avg: '$review_data.rating' },
                  nRatings: { $sum: 1 },
                },
              },
            
            {
                $project:{
                    _v:0,
                //    avg : { $avg : '$review_data.rating' } 
                }
            }
        ]
    ).then((data)=>{
        res.status(200).json({
            status:true,
            message:'Product Data Get Successfully',
            data:data
        })
    })
    .catch((err)=>{
        res.status(500).json({
            status: false,
            message: "Server error. Please try again.",
            error: err,
          });
    })
}

const viewAllsubscription = async( req , res)=>{
    return Subsciption.aggregate(
        [
            {
                $project:{
                    _v:0
                }
            }
        ]
    )
    .then((data)=>{
        res.status(200).json({
            status:true,
            message:'Subscription Data Get Successfully',
            data:data
        })
    })
    .catch((err)=>{
        res.status(500).json({
            status: false,
            message: "Server error. Please try again.",
            error: error,
          });
    })
}

module.exports = {
    getTokenData,
    register,
    login,
    viewProductList,
    viewAllsubscription
}