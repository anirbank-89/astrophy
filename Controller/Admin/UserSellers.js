var mongoose = require('mongoose');
var User = require("../../Models/user");
var passwordHash = require('password-hash')

var jwt = require('jsonwebtoken');

const { Validator } = require('node-input-validator');

var uuidv1 = require('uuid').v1;

const viewUserList = async (req,res)=>{
    return User.find(
        {type: { $in : "User" } },
        (err,docs)=>{
            if(err){
                res.status(400).json({
                    status: false,
                    message: "Server error. Data not available",
                    error: err
                });
            }
            else {
                res.status(200).json({
                    status: true,
                    message: "Users get successfully",
                    data: docs
                });
            }
        }).sort({ _id: 'desc' });
}

const viewUser = async (req,res)=>{
    let id=req.params.id;
    return User.findOne(
        {_id: { $in : [mongoose.Types.ObjectId(id)] } },
        (err,docs)=>{
        if(err){
            res.status(400).json({
                status: false,
                message: "Server error. Data not available",
                error: err
            });
        }
        else {
            res.status(200).json({
                status: true,
                message: "User get successfully",
                data: docs
            });
        }
    });
}

const viewSellerList = async (req,res)=>{
    return User.find(
        {type: { $in : "Seller" } },
        (err,docs)=>{
            if(err){
                res.status(400).json({
                    status: false,
                    message: "Server error. Data not available",
                    error: err
                });
            }
            else {
                res.status(200).json({
                    status: true,
                    message: "Sellers get successfully",
                    data: docs
                });
            }
        }).sort({ _id: 'desc' });
}

const viewSeller = async (req,res)=>{
    let id=req.params.id;
    return User.findOne(
        {_id: { $in : [mongoose.Types.ObjectId(id)] } },
        (err,docs)=>{
        if(err){
            res.status(400).json({
                status: false,
                message: "Server error. Data not available",
                error: err
            });
        }
        else {
            res.status(200).json({
                status: true,
                message: "Seller get successfully",
                data: docs
            });
        }
    });
}

module.exports = {
    viewUserList,
    viewUser,
    viewSellerList,
    viewSeller
}