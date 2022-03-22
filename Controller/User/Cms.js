var mongoose = require("mongoose");
var Achievements = require('../../Models/achievements');
var Blog = require("../../Models/blog");
var Faqcategory = require("../../Models/faqcat");
var Faqsubcategory = require("../../Models/faqsubcat");
var Faq = require("../../Models/faq");
var Cservice = require("../../Models/cservice");
var Subscribe = require("../../Models/subscribe");
var About = require("../../Models/about");
var Privacy = require("../../Models/privacy");
var Condition = require("../../Models/condition");
const { Validator } = require("node-input-validator");

const createCservice = async (req, res) => {
  const v = new Validator(req.body, {
    heading: "required",
    email: "required",
    qstn: "required"

  });
  let matched = await v.check().then((val) => val);
  if (!matched) {
    res.status(200).send({ status: false, error: v.errors });
  }
  let cms = {
    _id: mongoose.Types.ObjectId(),
    heading: req.body.heading,
    email: req.body.email,
    qstn: req.body.qstn
  };

  const cmsdt = new Cservice(cms);

  cmsdt
    .save()
    .then((docs) => {
      res.status(200).json({
        status: true,
        success: true,
        message: "Customer Service successfully created",
        data: docs,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        message: "Server error. Please try again",
        error: err,
      });
    });

};


const createSubscribe = async (req, res) => {
  const v = new Validator(req.body, {
    email: "required",

  });
  let matched = await v.check().then((val) => val);
  if (!matched) {
    res.status(200).send({ status: false, error: v.errors });
  }
  let cms = {
    _id: mongoose.Types.ObjectId(),
    email: req.body.email
  };

  const cmsdt = new Subscribe(cms);

  cmsdt
    .save()
    .then((docs) => {
      res.status(200).json({
        status: true,
        success: true,
        message: "Subscribe successfully created",
        data: docs,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        message: "Server error. Please try again",
        error: err,
      });
    });

};


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
  var id = req.params.id;

  return Blog.findOne({ _id: mongoose.Types.ObjectId(id) })
    .then(docs => {
      res.status(200).json({
        status: true,
        message: "Data get successfully!",
        data: docs
      });
    })
    .catch(err => {
      res.status(500).json({
        status: false,
        message: "Invalid id. Server error.",
        error: err.message
      });
    });
}

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

const viewAllfaqsubcat = async (req, res) => {
  return Faqsubcategory.aggregate(
    [
      {
        $match: { category_id: { $in: [mongoose.Types.ObjectId(req.params.id)] } },
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

const viewAllfaq = async (req, res) => {
  return Faq.aggregate(
    [
      {
        $match: { category_id: { $in: [mongoose.Types.ObjectId(req.body.category_id)] } },
      },
      {
        $match: { subcategory_id: { $in: [mongoose.Types.ObjectId(req.body.subcategory_id)] } },
      },
      {
        $lookup: {
          from: "faqcats",
          localField: "category_id",
          foreignField: "_id",
          as: "category_data"
        }
      },
      {
        $lookup: {
          from: "faqsubcats",
          localField: "subcategory_id",
          foreignField: "_id",
          as: "subcategory_data"
        }
      },
      { $sort: { _id: -1 } },
      {
        $project: {
          _v: 0
        }
      }
    ]
  ).then((data) => {
    res.status(200).json({
      status: true,
      message: 'Faq Data Get Successfully',
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


const getAbout = async (req, res) => {
  return About.aggregate([
    {
      $project: {
        _v: 0,
      },
    },
  ])
    .then((docs) => {
      res.status(200).json({
        status: true,
        message: "About get successfully",
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

const getPrivacy = async (req, res) => {
  return Privacy.aggregate([
    {
      $project: {
        _v: 0,
      },
    },
  ])
    .then((docs) => {
      res.status(200).json({
        status: true,
        message: "Privacy get successfully",
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



const getCondition = async (req, res) => {
  return Condition.aggregate([
    {
      $project: {
        _v: 0,
      },
    },
  ])
    .then((docs) => {
      res.status(200).json({
        status: true,
        message: "Condition get successfully",
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

module.exports = {
  viewAllAchievements,
  viewAchievementById,
  viewAllBlog,
  viewSingleBlog,
  viewAllfaqcat,
  viewAllfaq,
  createCservice,
  createSubscribe,
  viewAllfaqsubcat,
  getAbout,
  getPrivacy,
  getCondition
}