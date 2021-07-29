var express = require("express");
var router = express.Router();

const ProductController = require("../../Controller/User/Product");
const SubscriptionController = require("../../Controller/User/Subscription");

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

// router.get('/product/viewall',ProductController.viewProductList)
router.get("/listSubs/:id", SubscriptionController.viewAllsubscription);
router.post("/subscription-purchase", SubscriptionController.newSubscription);

module.exports = router;
