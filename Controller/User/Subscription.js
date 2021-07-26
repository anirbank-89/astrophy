var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var uuidv1 = require('uuid').v1;

var Subsciption = require('../../Models/subscription');

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
    viewAllsubscription
}