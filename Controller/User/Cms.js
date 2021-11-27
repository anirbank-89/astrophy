var mongoose = require("mongoose");
var Achievements = require('../../Models/achievements');
var Blog = require("../../Models/blog");
var Faqcategory = require("../../Models/faqcat");
var Faq = require("../../Models/faq");

const viewAllAchievements = async (req, res) => {
    var achievements = await Achievements.find().exec();

    if (achievements.length > 0) {
        return res.status(200).json({
            status: true,
            message: "Data get successfully!",
            data: achievements
        });
    }
    else {
        return res.status(200).json({
            status: true,
            message: "No achievement data added.",
            data: null
        });
    }
}

const viewAchievementById = async (req, res) => {
    var id = req.params.id;

    return Achievements.findById(
        { _id: id },
        (err, docs) => {
            if (!err) {
                res.status(200).json({
                    status: true,
                    message: "Data get successfully!",
                    data: docs
                });
            }
            else {
                res.status(500).json({
                    status: false,
                    message: "Invalid. Server error.",
                    error: err.message
                });
            }
        }
    );
}

const viewAllBlog = async (req, res) => {
    return Blog.aggregate([
      { $sort: { _id: -1 } },
      {
        $project: {
          _v: 0,
        },
      },
    ])
      .then((docs) => {
        res.status(200).json({
          status: true,
          message: "Blog get successfully",
          data: docs,
        });
      })
      .catch((err) => {
        res.status(500).json({
          status: false,
          message: "Server error. Please try again.",
          error: err,
        });
      });
  };

  const viewSingleBlog = async (req, res) => {
      let id  = req.params.id
    return Blog.findById(
        { _id: id },
        (err, docs) => {
            if (!err) {
                res.status(200).json({
                    status: true,
                    message: "Data get successfully!",
                    data: docs
                });
            }
            else {
                res.status(500).json({
                    status: false,
                    message: "Invalid. Server error.",
                    error: err.message
                });
            }
        }
    );
  };

  const viewAllfaqcat = async (req, res) => {
    return Faqcategory.aggregate(
        [
            {
                $lookup: {
                    from: "faqsubcats",//
                    localField: "_id",//
                    foreignField: "category_id",
                    as: "subcategory_data"//
                }
            },
            { $sort: { _id: -1 } },
            {
                $project: {
                    _v: 0
                }
            }
        ]
    ).
        then((data) => {
            res.status(200).json({
                status: true,
                message: 'Category Data Get Successfully',
                data: data
            })
        })
        .catch((err) => {
            res.status(500).json({
                status: false,
                message: "Server error. Please try again.",
                error: error,
            });
        })
}

const viewAllfaq = async( req ,res )=>
{
    return Faq.aggregate(
        [
            {
                $match: { category_id: { $in: [mongoose.Types.ObjectId(req.body.category_id)] } },
            }, 
            {
                $match: { subcategory_id: { $in: [mongoose.Types.ObjectId(req.body.subcategory_id)] } },
            }, 
            {
                $lookup:{
                    from:"faqcats",
                    localField:"category_id",
                    foreignField: "_id",
                    as:"category_data"
                }
            },
            {
                $lookup:{
                    from:"faqsubcats",
                    localField:"subcategory_id",
                    foreignField: "_id",
                    as:"subcategory_data"
                }
            },
            { $sort: { _id: -1 } },
            {
                $project:{
                    _v:0
                }
            }
        ]
    ).then((data)=>{
        res.status(200).json({
            status:true,
            message:'Faq Data Get Successfully',
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
    viewAllAchievements,
    viewAchievementById,
    viewAllBlog,
    viewSingleBlog,
    viewAllfaqcat,
    viewAllfaq
}