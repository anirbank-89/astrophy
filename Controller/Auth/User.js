var mongoose = require('mongoose');
var passwordHash = require('password-hash');
var jwt = require('jsonwebtoken');
var superagent = require('superagent');
const { Validator } = require('node-input-validator');

var User = require('../../Models/user');
var Product = require('../../Models/product');
var emailVerify = require('../../service/emailsend');




function createToken(data) {
    return jwt.sign(data, 'DonateSmile');
}

const getTokenData = async (token) => {
    let userData = await User.findOne({ token: token }).exec();
    // console.log('adminData', adminData);
    return userData;
}

const sendVerifyLink = async (req,res)=>{
    let data = {
        url:'http://localhost:3000/after-verify',
        to_email: req.body.email,
        to_name: req.body.name
    };
    
    superagent
      .post('https://new.easytodb.com/astrophymail/semdmail.php')
      .send(data) // sends a JSON post body
      .set('Content-Type', 'application/json')
      .end((err,info)=>{
          if (err) {
            console.log(err);
            return res.status(500).json({
                status: false,
                message: "Failed to send mail.",
                error: err
            });
          }
          else {
            console.log("Email info: ",info);
            return res.status(200).json({
                status: true,
                message: "Mail sent successfully.",
                data: data
            });
          }
      });
};

const register = async(req,res)=>{
    const v = new Validator(req.body,{
        email:'required|email',
        password:'required',// |minLength:8
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

    return all_users.save().then(async (data)=>{
        let email_verify = await emailVerify.verification(data.firstName,data.email);

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

const afterEmailVerify = async (req,res)=>{
    return User.findOneAndUpdate(
        {email: req.body.email},
        {status: true},
        {new: true},
        (err,docs)=>{
            if (!err) {
                res.status(200).json({
                    status: true,
                    message: "Email successfully verified",
                    data: docs
                });
            }
            else {
                res.status(500).json({
                    status: false,
                    message: "Failed to verify. Invalid email.",
                    error: err
                });
            }
        }
    );
}
// const signup = async (req,res)=>{}

const login = async(req,res) =>
{
    let v = new Validator(req.body,{
        email:'required|email',
        password:'required'// |minLength:8
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
                        message: 'Invalid Email or Password !!. Please try again.',
                        error: 'Invalid Email or Password !!',
                    });
                }
            }

          )
}

const viewProductList = async( req ,res )=>
{
    const myCustomLabels = {
        totalDocs: 'itemCount',
        docs: 'itemsList',
        limit: 'perPage',
        page: 'currentPage',
        nextPage: 'next',
        prevPage: 'prev',
        totalPages: 'pageCount',
        hasPrevPage: 'hasPrev',
        hasNextPage: 'hasNext',
        pagingCounter: 'pageCounter',
        meta: 'paginator'
      };
      
      const options = {
          page: req.params.page,
          limit: 3,
          customLabels: myCustomLabels
      };

    Product.aggregatePaginate(Product.aggregate(
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
                $addFields: {
                    avgRating: {
                        $avg: {
                            $map: {
                                input: "$review_data",
                                in: "$$this.rating"
                            }
                        }
                    }
                }
            },    
            {
                $project:{
                    _v:0,
                //    avg : { $avg : '$review_data.rating' } 
                }
            },
            
        ]
    ), options, function(err, result) {
        if(!err) {
            return res.status(200).json({
                        status:true,
                        message:'Product Data Get Successfully',
                        data:result
                    })
        } else {
            return res.status(500).json({
                        status: false,
                        message: "Server error. Please try again.",
                        error: err,
                      });
        }
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
    sendVerifyLink,
    register,
    afterEmailVerify,
    login,
    viewProductList,
    viewAllsubscription
}