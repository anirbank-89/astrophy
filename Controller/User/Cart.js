const mongoose = require('mongoose')
const Cart = require('../../Models/cart')
const Product = require('../../Models/product')
var User = require('../../Models/user')

const { Validator } = require('node-input-validator');

const addToCart = async (req,res)=>{
   const v = new Validator(req.body,{
    user_id:"required",
    prod_id:"required",
    productname:"required",
    qty:"required",
    price:"required",
    image:"required"
   })

   let matched = await v.check().then((val)=>val)
   if(!matched)
   {
       return res.status(400).json({
           status:false,
           data:null,
           message:v.errors
       })
   }

   let subData = await Cart.findOne({
    user_id: mongoose.Types.ObjectId(req.body.user_id),
    prod_id: mongoose.Types.ObjectId(req.body.prod_id)
  }).exec();
  if (subData == null || subData == "") {
        let dataSubmit = {
            _id:mongoose.Types.ObjectId(),
            user_id:mongoose.Types.ObjectId(req.body.user_id),
            prod_id:mongoose.Types.ObjectId(req.body.prod_id),
            productname:req.body.productname,
            qty:req.body.qty,
            price:req.body.price,
            image:req.body.image
        }

        const saveData = new Cart(dataSubmit);
        return saveData
        .save()
        .then((data)=>{
            res.status(200).json({
                status:true,
                message:'Item Added to Successfully',
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
  else
  {
    return res.status(400).json({
        status:false,
        data:null,
        message:"Item Already Added"
    })
  }
    
}

const updateCart = async ( req , res) =>{

    return Cart.findOneAndUpdate(
        { user_id: { $in: [mongoose.Types.ObjectId(req.params.user_id)] }, prod_id:{ $in: [mongoose.Types.ObjectId(req.params.prod_id)] } },
        req.body,
        async (err, data) => {
          if (err) {
            res.status(500).json({
              status: false,
              message: "Server error. Please try again.",
              error: err,
            });
          } else if (data != null) {
            data = { ...req.body, ...data._doc };
            res.status(200).json({
              status: true,
              message: "Cart update successful",
              data: data,
            });
          } else {
            res.status(500).json({
              status: false,
              message: "Item not match",
              data: null,
            });
          }
        }
      );
}

const getCart = async (req,res)=>{

    let subData = await Cart.findOne({
        user_id: mongoose.Types.ObjectId(req.params.user_id)
      }).exec();

    if (subData == null || subData == "") {
        res.status(500).json({
        status: false,
        message: "Cart Empty",
        data: null,
        });
    }
    else
    {
        res.status(200).json({
        status:true,
        message:'Cart Item Get Successfully',
        data:subData
        })
    }
}

const Delete = async (req ,res)=>{
    return Cart.remove(
        {_id: { $in : [mongoose.Types.ObjectId(req.params.id)]}})
        .then((data)=>{
            return res.status(200).json({
                status: true,
                message: 'Cart Item delete successfully',
                data: data
            });
        })
        .catch((err)=>{
            res.status(500).json({
                status: false,
                message: 'Server error. Please try again.',
                error: error,
            });
        })
} 

module.exports = {
    addToCart,
    getCart,
    updateCart,
    Delete
}