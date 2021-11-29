var mongoose = require("mongoose");
var About = require("../../Models/about");
var Blog = require("../../Models/blog");
var Privacy = require("../../Models/privacy");
var Upload = require("../../service/upload");
var Cookie = require("../../Models/cookie");
var Return = require("../../Models/return");
var Condition = require("../../Models/condition");
var SafetySchema = require("../../Models/safetyguide");
var AssoSchema = require("../../Models/associate");
var Banner = require("../../Models/banner");
var Achievements = require('../../Models/achievements');
var Cservice = require("../../Models/cservice");
var Subscribe = require("../../Models/subscribe");


const { Validator } = require("node-input-validator");

const createNUpdatecms = async (req, res) => {
  const v = new Validator(req.body, {
    content1: "required",
    content2: "required",
  });
  let matched = await v.check().then((val) => val);
  if (!matched) {
    res.status(200).send({ status: false, error: v.errors });
  }

  console.log(req.body);
  // return false;
  let cmsData = await About.find().exec();
  console.log(cmsData.length);
  // return false;
  //   .then((data)=>{
  if (cmsData.length == 0) {
    let cms = {
      _id: mongoose.Types.ObjectId(),
      content1: req.body.content1,
      content2: req.body.content2,
    };
    if (req.file != null && req.file != "" && typeof req.file != "undefined") {
      let image_url = await Upload.uploadFile(req, "blog");
      cms.image = image_url;
    }
    const cmsdt = new About(cms);

    cmsdt
      .save()
      .then((docs) => {
        res.status(200).json({
          status: true,
          success: true,
          message: "Abount Us successfully created",
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
  } else {
    //b
    //   console.log(req.files)
    //   if(Object.keys(req.files).length === 0 )
    //   {
    //     console.log("ok")
    //   }
    //   else
    //   {
    //     console.log("notok")
    //   }
    //   return false;
    let updateObj = {
      content1: req.body.content1,
      content2: req.body.content2,
    };
    if (req.file != null && req.file != "" && typeof req.file != "undefined") {
      let image_url = await Upload.uploadFile(req, "blog");
      updateObj.image = image_url;
    }
    About.findOneAndUpdate(
      { _id: { $in: [mongoose.Types.ObjectId(req.body.id)] } },
      updateObj,
      { new: true },
      // req.body,
      async (err, docs) => {
        if (err) {
          res.status(500).json({
            status: false,
            message: "Server error. Please try again.",
            error: err,
          });
        } else {
          res.status(200).json({
            status: true,
            message: "About Us updated successfully!",
            data: await docs,
          });
        }
      }
    );
  }
};

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

const createNUpdateblog = async (req, res) => {
  const v = new Validator(req.body, {
    heading: "required",
    content1: "required",
  });
  let matched = await v.check().then((val) => val);
  if (!matched) {
    res.status(200).send({ status: false, error: v.errors });
  }

  let cms = {
    _id: mongoose.Types.ObjectId(),
    heading: req.body.heading,
    content1: req.body.content1,
  };
  if (req.file != null && req.file != "" && typeof req.file != "undefined") {
    let image_url = await Upload.uploadFile(req, "blog");
    cms.image = image_url;
  }
  const cmsdt = new Blog(cms);

  cmsdt
    .save()
    .then((docs) => {
      res.status(200).json({
        status: true,
        success: true,
        message: "Blog successfully created",
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

const createNUpdateprivacy = async (req, res) => {
  const v = new Validator(req.body, {
    content1: "required",
  });
  let matched = await v.check().then((val) => val);
  if (!matched) {
    res.status(200).send({ status: false, error: v.errors });
  }

  console.log(req.body);
  // return false;
  let cmsData = await Privacy.find().exec();
  console.log(cmsData.length);
  // return false;
  //   .then((data)=>{
  if (cmsData.length == 0) {
    let cms = {
      _id: mongoose.Types.ObjectId(),
      content1: req.body.content1,
    };

    const cmsdt = new Privacy(cms);

    cmsdt
      .save()
      .then((docs) => {
        res.status(200).json({
          status: true,
          success: true,
          message: "Privacy successfully created",
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
  } else {
    let updateObj = {
      content1: req.body.content1,
    };

    Privacy.findOneAndUpdate(
      { _id: { $in: [mongoose.Types.ObjectId(req.body.id)] } },
      updateObj,
      { new: true },
      // req.body,
      async (err, docs) => {
        if (err) {
          res.status(500).json({
            status: false,
            message: "Server error. Please try again.",
            error: err,
          });
        } else {
          res.status(200).json({
            status: true,
            message: "Privacy updated successfully!",
            data: await docs,
          });
        }
      }
    );
  }
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

const cookie = async (req, res) => {
  const v = new Validator(req.body, {
    content1: "required",
  });
  let matched = await v.check().then((val) => val);
  if (!matched) {
    res.status(200).send({ status: false, error: v.errors });
  }

  console.log(req.body);
  // return false;
  let cmsData = await Cookie.find().exec();
  console.log(cmsData.length);
  // return false;
  //   .then((data)=>{
  if (cmsData.length == 0) {
    let cms = {
      _id: mongoose.Types.ObjectId(),
      content1: req.body.content1,
    };

    const cmsdt = new Cookie(cms);

    cmsdt
      .save()
      .then((docs) => {
        res.status(200).json({
          status: true,
          success: true,
          message: "Cookie successfully created",
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
  } else {
    let updateObj = {
      content1: req.body.content1,
    };

    Cookie.findOneAndUpdate(
      { _id: { $in: [mongoose.Types.ObjectId(req.body.id)] } },
      updateObj,
      { new: true },
      // req.body,
      async (err, docs) => {
        if (err) {
          res.status(500).json({
            status: false,
            message: "Server error. Please try again.",
            error: err,
          });
        } else {
          res.status(200).json({
            status: true,
            message: "Cookie updated successfully!",
            data: await docs,
          });
        }
      }
    );
  }
};

const getCookie = async (req, res) => {
  return Cookie.aggregate([
    {
      $project: {
        _v: 0,
      },
    },
  ])
    .then((docs) => {
      res.status(200).json({
        status: true,
        message: "Cookie get successfully",
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

const returnpolicy = async (req, res) => {
  const v = new Validator(req.body, {
    content1: "required",
  });
  let matched = await v.check().then((val) => val);
  if (!matched) {
    res.status(200).send({ status: false, error: v.errors });
  }

  console.log(req.body);
  // return false;
  let cmsData = await Return.find().exec();
  console.log(cmsData.length);
  // return false;
  //   .then((data)=>{
  if (cmsData.length == 0) {
    let cms = {
      _id: mongoose.Types.ObjectId(),
      content1: req.body.content1,
    };

    const cmsdt = new Return(cms);

    cmsdt
      .save()
      .then((docs) => {
        res.status(200).json({
          status: true,
          success: true,
          message: "Return Policy successfully created",
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
  } else {
    let updateObj = {
      content1: req.body.content1,
    };

    Return.findOneAndUpdate(
      { _id: { $in: [mongoose.Types.ObjectId(req.body.id)] } },
      updateObj,
      { new: true },
      // req.body,
      async (err, docs) => {
        if (err) {
          res.status(500).json({
            status: false,
            message: "Server error. Please try again.",
            error: err,
          });
        } else {
          res.status(200).json({
            status: true,
            message: "Return Policy updated successfully!",
            data: await docs,
          });
        }
      }
    );
  }
};

const getReturn = async (req, res) => {
  return Return.aggregate([
    {
      $project: {
        _v: 0,
      },
    },
  ])
    .then((docs) => {
      res.status(200).json({
        status: true,
        message: "Return get successfully",
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

const conditionpolicy = async (req, res) => {
  const v = new Validator(req.body, {
    content1: "required",
  });
  let matched = await v.check().then((val) => val);
  if (!matched) {
    res.status(200).send({ status: false, error: v.errors });
  }

  console.log(req.body);
  // return false;
  let cmsData = await Condition.find().exec();
  console.log(cmsData.length);
  // return false;
  //   .then((data)=>{
  if (cmsData.length == 0) {
    let cms = {
      _id: mongoose.Types.ObjectId(),
      content1: req.body.content1,
    };

    const cmsdt = new Condition(cms);

    cmsdt
      .save()
      .then((docs) => {
        res.status(200).json({
          status: true,
          success: true,
          message: "Condition Policy successfully created",
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
  } else {
    let updateObj = {
      content1: req.body.content1,
    };

    Condition.findOneAndUpdate(
      { _id: { $in: [mongoose.Types.ObjectId(req.body.id)] } },
      updateObj,
      { new: true },
      // req.body,
      async (err, docs) => {
        if (err) {
          res.status(500).json({
            status: false,
            message: "Server error. Please try again.",
            error: err,
          });
        } else {
          res.status(200).json({
            status: true,
            message: "Condition Policy updated successfully!",
            data: await docs,
          });
        }
      }
    );
  }
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

const saftyguide = async (req, res) => {
  const v = new Validator(req.body, {
    content1: "required",
  });
  let matched = await v.check().then((val) => val);
  if (!matched) {
    res.status(200).send({ status: false, error: v.errors });
  }

  console.log(req.body);
  // return false;
  let cmsData = await SafetySchema.find().exec();
  console.log(cmsData.length);
  // return false;
  //   .then((data)=>{
  if (cmsData.length == 0) {
    let cms = {
      _id: mongoose.Types.ObjectId(),
      content1: req.body.content1,
    };

    const cmsdt = new SafetySchema(cms);

    cmsdt
      .save()
      .then((docs) => {
        res.status(200).json({
          status: true,
          success: true,
          message: "Safety Guide successfully created",
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
  } else {
    let updateObj = {
      content1: req.body.content1,
    };

    SafetySchema.findOneAndUpdate(
      { _id: { $in: [mongoose.Types.ObjectId(req.body.id)] } },
      updateObj,
      { new: true },
      // req.body,
      async (err, docs) => {
        if (err) {
          res.status(500).json({
            status: false,
            message: "Server error. Please try again.",
            error: err,
          });
        } else {
          res.status(200).json({
            status: true,
            message: "Safety Guide updated successfully!",
            data: await docs,
          });
        }
      }
    );
  }
};

const getsaftyguide = async (req, res) => {
  return SafetySchema.aggregate([
    {
      $project: {
        _v: 0,
      },
    },
  ])
    .then((docs) => {
      res.status(200).json({
        status: true,
        message: "Safety Guide get successfully",
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

const createassociate = async (req, res) => {
  const v = new Validator(req.body, {
    heading: "required",
    content1: "required",
  });
  let matched = await v.check().then((val) => val);
  if (!matched) {
    res.status(200).send({ status: false, error: v.errors });
  }

  let cms = {
    _id: mongoose.Types.ObjectId(),
    heading: req.body.heading,
    content1: req.body.content1,
  };
  if (req.file != null && req.file != "" && typeof req.file != "undefined") {
    let image_url = await Upload.uploadFile(req, "blog");
    cms.image = image_url;
  }
  const cmsdt = new AssoSchema(cms);

  cmsdt
    .save()
    .then((docs) => {
      res.status(200).json({
        status: true,
        success: true,
        message: "Associate successfully created",
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

const viewAllAsso = async (req, res) => {
  return AssoSchema.aggregate([
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
        message: "Associates get successfully",
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

const updateassociate = async (req, res) => {
  const v = new Validator(req.body, {
    heading: "required",
    content1: "required",
  });
  let updateObj = {
    heading: req.body.heading,
    content1: req.body.content1,
  };
  if (req.file != null && req.file != "" && typeof req.file != "undefined") {
    let image_url = await Upload.uploadFile(req, "blog");
    updateObj.image = image_url;
  }
  AssoSchema.findOneAndUpdate(
    { _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } },
    updateObj,
    { new: true },
    // req.body,
    async (err, docs) => {
      if (err) {
        res.status(500).json({
          status: false,
          message: "Server error. Please try again.",
          error: err,
        });
      } else {
        res.status(200).json({
          status: true,
          message: "Associate updated successfully!",
          data: await docs,
        });
      }
    }
  );
};

const Deleteassociate = async (req, res) => {
  return AssoSchema.remove(
    { _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } })
    .then((data) => {
      return res.status(200).json({
        status: true,
        message: 'Associate delete successfully',
        data: data
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        message: 'Server error. Please try again.',
        error: error,
      });
    })

}

const createBanner = async (req, res) => {
  let cms = {
    _id: mongoose.Types.ObjectId(),
    name: req.body.name,
    description: req.body.description,
    link: req.body.link
  };
  if (req.file != null && req.file != "" && typeof req.file != "undefined") {
    let image_url = await Upload.uploadFile(req, "banner");
    cms.image = image_url;
  }
  const cmsdt = new Banner(cms);

  cmsdt
    .save()
    .then((docs) => {
      res.status(200).json({
        status: true,
        success: true,
        message: "Banner Saved Successfully",
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

const viewAllBanner = async (req, res) => {
  return Banner.aggregate([
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
        message: "Banner get successfully",
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

const updateBanner = async (req, res) => {
  let updateObj = {
    name: req.body.name,
    description: req.body.description,
    link: req.body.link
  };
  if (req.file != null && req.file != "" && typeof req.file != "undefined") {
    let image_url = await Upload.uploadFile(req, "banner");
    updateObj.image = image_url;
  }
  Banner.findOneAndUpdate(
    { _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } },
    updateObj,
    { new: true },
    // req.body,
    async (err, docs) => {
      if (err) {
        res.status(500).json({
          status: false,
          message: "Server error. Please try again.",
          error: err,
        });
      } else {
        res.status(200).json({
          status: true,
          message: "Banner updated successfully!",
          data: await docs,
        });
      }
    }
  );
};

const Deletebanner = async (req, res) => {
  return Banner.remove(
    { _id: { $in: [mongoose.Types.ObjectId(req.params.id)] } })
    .then((data) => {
      return res.status(200).json({
        status: true,
        message: 'Banner delete successfully',
        data: data
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        message: 'Server error. Please try again.',
        error: error,
      });
    })

}

const setBannerStatus = async (req, res) => {
  var id = req.params.id;

  var current_status = await Banner.findById({ _id: id }).exec();

  console.log("Category data", current_status);

  if (current_status.status === true) {
    return Banner.findByIdAndUpdate(
      { _id: id },
      { $set: { status: false } },
      { new: true },
      (err, docs) => {
        if (!err) {
          res.status(200).json({
            status: true,
            message: "Banner has been made inactive.",
            data: docs
          });
        }
        else {
          res.status(500).json({
            status: false,
            message: "Invalid id. Server error.",
            error: err
          });
        }
      }
    );
  }
  else {
    return Banner.findByIdAndUpdate(
      { _id: id },
      { $set: { status: true } },
      { new: true },
      (err, docs) => {
        if (!err) {
          res.status(200).json({
            status: true,
            message: "Banner has been activated.",
            data: docs
          });
        }
        else {
          res.status(500).json({
            status: false,
            message: "Invalid id. Server error.",
            error: err
          });
        }
      }
    );
  }
}

const addAchievement = async (req, res) => {
  const v = new Validator(req.body, {
    image: "required",
    description: "required",
  });
  let matched = v.check().then((val) => val);
  if (!matched) {
    res.status(400).json({ status: false, errors: v.errors });
  }

  var image_url = await Upload.uploadFile(req, "cms/achievements");

  let saveData = {
    _id: mongoose.Types.ObjectId(),
    image: image_url,
    description: req.body.description
  }

  const NEW_ACHIEVEMENT = new Achievements(saveData);

  return NEW_ACHIEVEMENT.save((err, docs) => {
    if (!err) {
      res.status(200).json({
        status: true,
        message: "Data added successfully!",
        data: docs
      });
    }
    else {
      res.status(500).json({
        status: false,
        message: "Failed to add data. Server error.",
        error: err.message
      });
    }
  });
}

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

const editAchievement = async (req, res) => {
  // const v = new Validator(req.body, {
  //   image: "required",
  //   description: "required",
  // });
  // let matched = v.check().then((val) => val);
  // if (!matched) {
  //   res.status(400).json({ status: false, errors: v.errors });
  // }

  var id = req.params.id;

  if (
    req.file != "" || 
    req.file != null || 
    typeof req.file != "undefined"
  ) {
    var image_url = await Upload.uploadFile(req, "cms/achievements");
    req.body.image = image_url;
  }

  return Achievements.findByIdAndUpdate(
    { _id: id },
    req.body,
    { new: true },
    (err, docs) => {
      if (!err) {
        res.status(200).json({
          status: true,
          message: "Data updated successfully!",
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

const deleteAchievement = async (req,res)=>{
  var id = req.params.id;

  return Achievements.findByIdAndDelete(
    { _id: id },
    (err, docs) => {
      if (!err) {
        res.status(200).json({
          status: true,
          message: "Data deleted successfully!",
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

const viewCustomerservice = async (req, res) => {
  var achievements = await Cservice.find().exec();

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

const viewSubscribe = async (req, res) => {
  var achievements = await Subscribe.find().exec();

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
      message: "No Subscribe data added.",
      data: null
    });
  }
}

module.exports = {
  createNUpdatecms,
  createNUpdateblog,
  viewAllBlog,
  getAbout,
  createNUpdateprivacy,
  cookie,
  returnpolicy,
  conditionpolicy,
  getPrivacy,
  getCookie,
  getCondition,
  getReturn,
  saftyguide,
  getsaftyguide,
  createassociate,
  viewAllAsso,
  updateassociate,
  Deleteassociate,
  createBanner,
  viewAllBanner,
  updateBanner,
  Deletebanner,
  setBannerStatus,
  addAchievement,
  viewAllAchievements,
  viewAchievementById,
  editAchievement,
  deleteAchievement,
  viewCustomerservice,
  viewSubscribe
};
