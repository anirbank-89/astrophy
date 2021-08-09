const mongoose = require('mongoose')
const Cart = require('../../Models/cart')
const Product = require('../../Models/product')
var User = require('../../Models/user')

const addToCart = async (req,res)=>{
    Product.findOne({_id: {$in: [mongoose.Types.ObjectId(req.body.prod_id)]}})
      .then((product)=>{
          console.log(product)
          User.findOne({_id: {$in: [mongoose.Types.ObjectId(req.params.id)]}})
            .then((user)=>{
                user.addToCart2(product)
                res.status(200).json({
                    status: true,
                    message: "Product added to cart sucessfully",
                    data: user
                })
            })
      }) 
    //   .catch(fault=>{
    //       res.status(500).json({
    //           status: false,
    //           message: "Server error. Please try again.",
    //           error: fault
    //       })
    //   })
}

const getCart = async (req,res)=>{
    User.findOne({_id: {$in: [mongoose.Types.ObjectId(req.params.id)]}})
    //   .populate('cart.items.prod_id')
    //   .execPopulate()
      .then(user => {
          console.log(user)
          res.status(200).json({
              status: true,
              message: "Cart items found",
              cart: user.cart.items
          })
      })
}

module.exports = {
    addToCart,
    getCart
}