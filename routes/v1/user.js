var express = require("express");
var router = express.Router();

const ProductController = require("../../Controller/User/Product");
const SubscriptionController = require("../../Controller/User/Subscription");// added by anirbank-93
const ServiceController = require('../../Controller/User/Service');          // added by anirbank-93
const ShopController = require("../../Controller/User/Shop");      // added by anirbank-93
const ShopServiceController = require("../../Controller/User/ShopServices"); // added by anirbank-93

const multer = require('multer')

var storage = multer.memoryStorage()
var upload = multer({storage: storage})

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

router.get('/service', ServiceController.viewAllServices); // added by anirbank-93
router.get('/service/:id', ServiceController.viewService); // added by anirbank-93

router.post('/shop', ShopController.register);             // added by anirbank-93
router.get('/shop', ShopController.viewAllShops);          // added by anirbank-93
router.get('/shop/:id', ShopController.viewShop);          // added by anirbank-93
router.put('/shop/:id', ShopController.editShop);          // added by anirbank-93
router.delete('/shop/:id', ShopController.deleteShop);     // added by anirbank-93

router.post('/shop/services', upload.single("image"), ShopServiceController.register)// added by anirbank-93
/** ================================= with login url section end ================================ */

module.exports = router;
