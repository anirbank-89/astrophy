const mongoose = require('mongoose');
const passwordHash = require('password-hash');

let UserSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    city: String,
    about: String,
    include: [],
    token:{
        type:String,
        required:false,
        unique:true
    },
    type:{
        type:String,
        required:false,
        default:'User'
    },
    start: {
		type: Date,
		default: Date.now,
		required: false
	},
    image: String,
    status: {
        type: Boolean,
        required: false,
        default: false//
    }
});

// UserSchema.methods.addToCart2 = function(product){
//     let cart = this.cart

//     if (cart.items.length == 0) {
//         cart.items.push({prod_id:product._id, prod_name:product.name, prod_price:product.price, qty:1})
//         cart.totalPrice = product.price;
//     }
//     else {
//         const isExisting = cart.items.findIndex(objInItems => {
//             return new String(objInItems.prod_id).trim() == new String(product._id).trim()
//         })
//         if(isExisting == -1) {
//             cart.items.push({prod_id: product._id, prod_name:product.name, prod_price:product.price,qty: 1})
//             cart.totalPrice += product.price
//         }
//         else {
//             var existingProductInCart = cart.items[isExisting]
//             existingProductInCart.qty += 1
//             cart.totalPrice += product.price
//         }
//     }

//     console.log('User in schema: ', this);
//     return this.save();
// }

UserSchema.methods.comparePassword = function (candidatePassword) {
    return passwordHash.verify(candidatePassword, this.password);
}

module.exports = mongoose.model("User", UserSchema);