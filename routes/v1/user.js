var express = require("express");
var router = express.Router();

const ProductController = require("../../Controller/User/Product");
const UserSellerController=require('../../Controller/User/UserSellers');//added by anirbank-93
const SubscriptionController = require("../../Controller/User/Subscription");// added by anirbank-93
const ServiceController = require('../../Controller/User/Service');          // added by anirbank-93
const ShopController = require("../../Controller/User/Shop");      // added by anirbank-93
const ShopServiceController = require("../../Controller/User/ShopServices"); // added by anirbank-93
const CartController = require('../../Controller/User/Cart')
const WishlistController = require('../../Controller/User/Wishlist')
const Servicewishlist = require('../../Controller/User/Servicewishlist')
const CheckoutController = require('../../Controller/User/Checkout')
const MyaccountController = require('../../Controller/User/Myaccount')
const ProductreviewController = require('../../Controller/User/ProductReview')
const ServiceMyaccountController = require('../../Controller/User/ServiceMyaccount')//krittika
const ServiceCartController = require('../../Controller/User/ServiceCart')//krittika
const ServiceCheckoutController = require('../../Controller/User/ServiceCheckout')//krittika
const SellerMyaccountController = require('../../Controller/User/SellerMyaccount')//krittika
const ServicereviewController = require('../../Controller/User/ServiceReview')
const SeaarchController = require('../../Controller/User/Search')
const ContactUsController = require('../../Controller/User/ContactUs')






const multer = require('multer');

var storage1 = multer.memoryStorage();
var upload1 = multer({storage: storage1});

var storage2 = multer.diskStorage({
  destination: (req,file,cb)=>{cb(null,"uploads/shop_services")},
  filename: (req,file,cb)=>{
    if(file.fieldname == 'file1'){
      pro_img1 = "banner_"+file.originalname;// +Math.floor(100000+(Math.random()*900000))+"_"+Date.now()+"_"
      banner_img = pro_img1;
      cb(null,pro_img1);
    }
    if (file.fieldname == "file2") {
      pro_img2 = "shop_"+file.originalname;// +Math.floor(100000+(Math.random()*900000))+"_"+Date.now()+"_"
      shop_img = pro_img2;
      cb(null, pro_img2);
    }
  }
});

var upload2 = multer({storage: storage2});
var uploadMultiple = upload2.fields([{name: 'file1', maxCount: 10}, {name: 'file2', maxCount: 10}]);

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
router.post("/userSubs", SubscriptionController.viewUsersubscription);
router.post("/subscription-purchase", SubscriptionController.newSubscription);// added by anirbank-93

router.get('/seller/:id', UserSellerController.viewUser);   // added by anirbank-93
router.get('/list-of-users', UserSellerController.viewUserList);// added by anirbank-93
router.get('/list-of-sellers', UserSellerController.viewSellerList);// added by anirbank-93

router.get('/service', ServiceController.viewAllServices); // added by anirbank-93
router.get('/service/:id', ServiceController.viewService); // added by anirbank-93
router.get('/service/subcategory/:id', ServiceController.viewServiceSubCategory);// added by anirbank-93
// route to fetch all shop services available for a service category
router.get('/service/shop-services/:id', ServiceController.viewShopServicesPerService);// added by anirbank-93

router.post('/shop', uploadMultiple, ShopController.createNUpdate);// added by anirbank-93
router.get('/shop/:id', ShopController.viewShop);              // added by anirbank-93

router.post('/shop/services', upload1.single("image"), ShopServiceController.register);// added by anirbank-93
router.post('/shop-service-images', upload1.single("image"), ShopServiceController.shopserviceImageUrl);// anirbank-93
router.get('/shop/all-services', ShopServiceController.viewAllShopServices); // added by anirbank-93
// route to fetch all services of a shop
router.get('/shop/all-services/:id', ShopServiceController.viewShopServicesPerSeller); // added by anirbank-93
// route to fetch one service of a shop
router.get('/shop/view-shopservice/:id', ShopServiceController.viewOneService);        // added by anirbank-93
// no. of times shop service sales
router.get('/sales-count/:serv_id', ShopServiceController.salesCount);                 // added by anirbank-93
router.put('/shop/services/:id', upload1.single("image"), ShopServiceController.update);// added by anirbank-93

router.post('/shop/chatservices', upload1.single("image"), ShopServiceController.chatServiceregister);// added by anirbank-93
router.post('/image-uploadurl', upload1.single("image"), ShopServiceController.chatImageUrl);



router.post('/add-to-cart', CartController.addToCart);
router.put('/updateCart/:id', CartController.updateCart);
router.get('/get-cart/:user_id', CartController.getCart);
router.delete('/cartDelete/:id',CartController.Delete)

router.post('/wishlist', WishlistController.create);
router.get('/getWishlist/:user_id', WishlistController.getWish);
router.delete('/deleteWishlist/:id', WishlistController.Delete);

router.post('/servicewishlist', Servicewishlist.create);
router.get('/servicegetWishlist/:user_id', Servicewishlist.getWish);
router.delete('/servicedeleteWishlist/:id', Servicewishlist.Delete);

router.post('/checkCoupon', CartController.checkCoupon);

router.post('/checkout', CheckoutController.create);

router.post('/checkout', CheckoutController.create);

router.get('/orderdetails/:user_id', MyaccountController.viewAll);
router.put('/refundProduct/:id', MyaccountController.refundProduct);
router.put('/update-profile/:id', upload1.single("image"), MyaccountController.updateProfile);
router.put('/update-password/:id', MyaccountController.updatePassword);

router.post('/productreview', ProductreviewController.create);

router.get('/productreview/:prod_id', ProductreviewController.getReviews);


//krittika
router.post('/servicecart', ServiceCartController.addToServiceCart);
router.get('/servicecart/:user_id', ServiceCartController.getServiceCart);
router.delete('/servicecart/:id',ServiceCartController.Delete)

router.post('/servicecheckout', ServiceCheckoutController.create);

router.post('/accept_status', ServiceCheckoutController.setStatus);

router.post('/tips', ServiceCheckoutController.setTips);
router.get('/getSellersettlement/:id', ServiceCheckoutController.setSellersettlement);



router.get('/servicebookhistory/:user_id', ServiceMyaccountController.viewAll);
router.get('/sellerbookhistory/:seller_id', SellerMyaccountController.viewAll);
router.post('/sellerbookhistoryrepo', SellerMyaccountController.reportViewAll);
router.post('/servicereview', ServicereviewController.create);
router.get('/servicereview/:serv_id', ServicereviewController.getReviews);
router.get('/sellersingleBookinghis/:id', SellerMyaccountController.viewSingleOrder);


// contact us
router.post('/sellercontact', ContactUsController.sellerContactUsInfo);
router.post('/user_questions', ContactUsController.userContactUsInfo);
// contact us
router.get('/sellercomission/:id',UserSellerController.sellercomHistory);
router.get('/totalandpendingcomission/:id',UserSellerController.totalandpendingcomission);
router.post('/withdraw-request',UserSellerController.applyWithdraw);
router.get('/withdraw-history/:id',UserSellerController.withdrawHistory);
router.post('/Kyc',UserSellerController.kyccreateNUpdate);
router.get('/Kyc/:id',UserSellerController.getKyc);
router.post('/getGraphcomission',UserSellerController.getGraphcomission);

router.post('/apply-for-seller', upload1.single("image"), UserSellerController.applyForSeller); 
router.get('/seller-approval-status/:id', UserSellerController.getSellerApprovalStatus);






// router.post('/searchSevice', SeaarchController.serviceSearch);
// router.post('/searchProduct', SeaarchController.productSearch);













/** ================================= with login url section end ================================ */

module.exports = router;
