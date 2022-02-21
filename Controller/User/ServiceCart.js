var mongoose = require("mongoose");
const { Validator } = require("node-input-validator");

const ServiceCart = require("../../Models/servicecart");
const NEW_SERVIECART = require("../../Models/new_servicecart");

const addToServiceCart = async (req, res) => {
  const v = new Validator(req.body, {
    user_id: "required",
    serv_id: "required",
    seller_id:"required",
    servicename: "required",
    price: "required",
    image: "required",
  });

  let matched = await v.check().then((val) => val);
  if (!matched) {
    return res.status(400).json({
      status: false,
      data: null,
      message: v.errors,
    });
  }

  let subData = await NEW_SERVIECART.findOne({
    user_id: mongoose.Types.ObjectId(req.body.user_id), 
    serv_id: mongoose.Types.ObjectId(req.body.serv_id), 
    status:true
  }).exec();
  if (subData == null || subData == "") {
      
  
    let dataSubmit = {
      _id: mongoose.Types.ObjectId(),
      user_id: mongoose.Types.ObjectId(req.body.user_id),
      serv_id: mongoose.Types.ObjectId(req.body.serv_id),
      seller_id: mongoose.Types.ObjectId(req.body.seller_id),
      servicename: req.body.servicename,
      price: req.body.price,
      image: req.body.image,
    }
    if (req.body.currency != null || req.body.currency != "" || typeof req.body.currency != "undefined") {
      dataSubmit.currency = req.body.currency;
    }

    const saveData = new NEW_SERVIECART(dataSubmit);
    return saveData
      .save()
      .then((data) => {
        res.status(200).json({
          status: true,
          message: "service Added to Successfully",
          data: data,
        });
      })
      .catch((err) => {
        res.status(500).json({
          status: false,
          message: "Server error. Please try again.",
          error: err,
        });
      });
  } else {
    return res.status(400).json({
      status: false,
      data: null,
      message: "service Already Added",
    });
  }
};

/*const updateServiceCart = async (req, res) => {
  return Cart.findOneAndUpdate(
    { _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } },
    req.body,
    {new: true},
    async (err, data) => {
      if (err) {
        res.status(500).json({
          status: false,
          message: "Server error. Please try again.",
          error: err,
        });
      } else if (data != null) {
        // data = { ...req.body, ...data._doc };
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
};*/

const getServiceCart = async (req, res) => {
  return NEW_SERVIECART.aggregate([
    {
      $match: {
        user_id: mongoose.Types.ObjectId(req.params.user_id),
        status :true
      },
    },
    {
      $project: {
        // _id: 0,

        __v: 0,
      },
    },
  ])
    .then((data) => {
      if (data.length > 0) {
        return res.status(200).json({
          status: true,
          message: "Service Cart Listing Successfully",
          data: data,
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "Empty ServiceCart",
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
};

const Delete = async (req, res) => {
  var id = req.params.id;

  return NEW_SERVIECART.findOneAndDelete({ _id: mongoose.Types.ObjectId(id) })
    .then((data) => {
      return res.status(200).json({
        status: true,
        message: "Service Cart Item delete successfully",
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        message: "Invalid id. Server error.",
        error: error,
      });
    });
};

/*const checkCoupon = async(req,res)=>
{
  let coupData = await Coupon.findOne({
    name: req.body.name,
    status: true,
  }).exec();
  // console.log(coupData)
  if(coupData!='' && coupData !=null)
  {
    return res.status(200).json({
      status:true,
      data:coupData,
      message:"Coupon get successfully"
    })
  }
  else
  {
    return res.status(400).json({
      status:false,
      data:null,
      message:"No Data"
    })
  }
}*/

module.exports = {
  addToServiceCart,
  getServiceCart,
  //updateServiceCart,
  Delete,
  //checkCoupon
};
