var mongoose = require('mongoose')
var Admin = require('../../Models/admin')
var passwordHash = require('password-hash');

var jwt = require('jsonwebtoken');
const { Validator } = require('node-input-validator');

function createToken(data) {
    return jwt.sign(data, 'DonateSmile');
}

const getTokenData = async (token) => {
    let adminData = await Admin.findOne({ token: token }).exec();
    // console.log('adminData', adminData);
    return adminData;
}

const register = async(req,res)=>{
    const v = new Validator(req.body,{
        email:'required|email',
        password:'required|minLength:8',
        fullname:'required'
    })
    let matched = await v.check().then((val)=>val)
    if(!matched)
    {
        return res.status(200).send({ status: false, error: v.errors });
    }
    let adminData = {
        _id:mongoose.Types.ObjectId(),
        email:req.body.email,
        password:passwordHash.generate(req.body.password),
        token:createToken(req.body)
    }
    if (typeof (req.body.phone) !='undefined')
    {
        adminData.phone = Number(req.body.phone)
    }

    const admin = new Admin(adminData)

    return admin.save().then((data)=>{
        return res.status(200).json({
            status: true,
            success: true,
            message: 'New Admin created successfully',
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
    })
}

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
        })
    }

    // return Admin.findOne({email : req.body.email}, async(err,admin)=>{
    //     console.log(admin)
    //     if(err)
    //     {
    //         res.status(200).json({
    //             status: false,
    //             message: 'Server error. Please try again.',
    //             error: err,
    //         });
    //     }
    //     else if(admin!='' && admin.comparePassword(req.body.password))
    //     {
    //         res.status(200).json({
    //             status: true,
    //             message: 'Admin login successful',
    //             data: admin
    //         });
    //     }
    //     else
    //     {
    //         res.status(200).json({
    //             status: false,
    //             message: 'Server error. Please try again.',
    //             error: err,
    //         });
    //     }
    // })
    Admin.findOne({email:req.body.email})
        //   .exe()
          .then(admin =>{
                if(admin.length < 1 )
                {
                    return res.status(401).json({
                            status: false,
                            message: 'Server error. Please try again.',
                            error: err,
                        });
                }
                if(admin.comparePassword(req.body.password))
                {
                    return res.status(200).json({
                        status: true,
                        message: 'Admin login successful',
                        data: admin
                    });
                }
                else
                {
                    return res.status(200).json({
                        status: false,
                        message: 'Server error. Please try again.',
                        error: err,
                    });
                }
            }

          )
}
module.exports = {
    register,
    getTokenData,
    login
}