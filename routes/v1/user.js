var express = require("express");
var router = express.Router();

const ProductController = require("../../Controller/User/Product");
const UserSellerController=require('../../Controller/User/UserSellers');//added by anirbank-93
const SubscriptionController = require("../../Controller/User/Subscription");// added by anirbank-93
const ServiceController = require('../../Controller/User/Service');          // added by anirbank-93
const ShopController = require("../../Controller/User/Shop");      // added by anirbank-93
const ShopServiceController = require("../../Controller/User/ShopServices"); // added by anirbank-93

const multer = require('multer');

var storage1 = multer.memoryStorage();
var upload1 = multer({storage: storage1});

var storage2 = multer.diskStorage({
  destination: (req,file,cb)=>{cb(null,"uploads/shop_banner_n_image")},
  filename: (req,file,cb)=>{
    if(file.fieldname == 'banner_img'){
      pro_img1 = "banner_"+Math.floor(100000+(Math.random()*900000))+"_"+Date.now()+"_"+file.originalname;
      banner_img = pro_img1;
      cb(null,pro_img1);
    }
    if (file.fieldname == "shop_img") {
      pro_img2 = "shop_"+Math.floor(100000+(Math.random()*900000))+"_"+Date.now()+"_"+file.originalname;
      shop_img = pro_img2;
      cb(null, pro_img2);
    }
  }
});

var upload2 = multer({storage: storage2});
var uploadMultiple = upload2.fields([{name: 'banner_img', maxCount: 1}, {name: 'shop_img', maxCount: 1}]);

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send({ status: false });
});

router.use((req, res, next) => {
  if (req.userType == "User") {
    next();
  } else {
    res.send({ status: false, msg: "Permission not found" });
  }
});

/** ================================= with login url ================================= */
// router.get('/product/viewall',ProductController.viewProductList)
router.get("/listSubs/:id", SubscriptionController.viewAllsubscription);
router.post("/subscription-purchase", SubscriptionController.newSubscription);// added by anirbank-93

router.get('/seller/:id', UserSellerController.viewUser);   // added by anirbank-93
router.get('/list-of-users', UserSellerController.viewUserList);// added by anirbank-93
router.get('/list-of-sellers', UserSellerController.viewSellerList);// added by anirbank-93

router.get('/service', ServiceController.viewAllServices); // added by anirbank-93
router.get('/service/:id', ServiceController.viewService); // added by anirbank-93

router.get('/service/subcategory/:id', ServiceController.viewServiceSubCategory)// added by anirbank-93

router.post('/shop', uploadMultiple, ShopController.createNUpdate);// added by anirbank-93
router.get('/shop/:id', ShopController.viewShop);              // added by anirbank-93

router.post('/shop/services', upload1.single("image"), ShopServiceController.register);// added by anirbank-93
router.put('/shop/services/:id', upload1.single("image"), ShopServiceController.update);// added by anirbank-93
/** ================================= with login url section end ================================ */

module.exports = router;
