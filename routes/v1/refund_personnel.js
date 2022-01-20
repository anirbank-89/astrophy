var express = require('express');
var multer = require('multer');

var router = express.Router();

var storage = multer.memoryStorage()
var upload = multer({storage: storage});

const MY_ACCOUNT = require('../../Controller/RefundPersonnel/MyAccount');

router.get('/profile/:id', MY_ACCOUNT.getProfile);
router.put('/profile/:id', upload.single("image"), MY_ACCOUNT.updateProfile);
router.put('/update-password/:id', MY_ACCOUNT.updatePassword);

module.exports = router;