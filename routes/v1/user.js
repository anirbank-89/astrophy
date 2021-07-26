var express = require('express');
var router = express.Router();

const ProductController = require('../../Controller/User/Product');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send({status: false})
});

router.use((req,res,next)=>{
    if (req.userType == "User") {
        next();
    }
    else {
        res.send({status: false, msg: "Permission not found" })
    }
});

/** ================================= with login url ================================= */
router.get('/product/viewall',ProductController.viewProductList)
/** ================================= with login url section end ================================ */

module.exports = router;