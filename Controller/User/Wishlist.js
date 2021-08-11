const mongoose = require('mongoose')
const Cart = require('../../Models/cart')
var Wishlist = require('../../Models/wishlist')

const { Validator } = require('node-input-validator');

const create = async (req,res)=>{
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

   let subData = await Wishlist.findOne({
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

        const saveData = new Wishlist(dataSubmit);
        return saveData
        .save()
        .then((data)=>{
            Cart.remove({
                user_id: mongoose.Types.ObjectId(req.body.user_id),
                prod_id: mongoose.Types.ObjectId(req.body.prod_id)
              }, function (err, result){
                if (err) 
                {
                    res.status(500).json({
                        status: false,
                        message: "Server error. Please try again.",
                        error: err,
                      });
                }
                else
                {
                    res.status(200).json({
                        status:true,
                        message:'Item Added to Successfully',
                        data:data
                    })
                }
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

const getWish = async (req,res)=>{

  return Wishlist.aggregate([
    {
        $match: {
            user_id: mongoose.Types.ObjectId(req.params.user_id),
        },
    },
    {
        $project: {
            // _id: 0,
            
            __v: 0,            
        }
    }
])
    .then((data) => {
        if (data.length > 0) {
            return res.status(200).json({
                status: true,
                message: "Cart Listing Successfully",
                data: data,
            });
        } else {
            return res.status(200).json({
                status: true,
                message: "Empty Cart",
                data: data,
            });
        }

    })
    .catch((err) => {
        return res.status(500).json({
            status: false,
            message: "No Match",
            data: null,
        });
    });
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
    create,
    getWish,
    Delete
}