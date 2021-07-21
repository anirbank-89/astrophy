var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send({status: false})
});

const AdminController = require('../../Controller/Auth/Admin');
const middleware  = require('../../service/middleware').middleware;

/** ================================= without login url ================================= */

router.post('/admin/register', AdminController.register);
router.post('/admin/login', AdminController.login);


/** ================================= without login url section end ================================ */
router.use(middleware);

const AdminRoute = require('./admin');



// router.use('/admin', AdminRoute);

module.exports = router;