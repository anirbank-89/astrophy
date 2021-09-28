var mongoose = require("mongoose");
const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AchDHzqlzc9vba33DbYMYzU9ejnPC5211sTZ_yvtIZuz2Q9m3LyqWBHzzAt1JToq--0eWW9ijhGhvRSC',
    'client_secret': 'EEg0w2hdiB4k1qDADeO00NsxzI1Vh8ehfiLMT2kIh_5MOMwJvz10YD1O1jsvJGeXqyfzg9g5ps_idCbd'
  });

  var amt = null;

const pay = async(req,res)=>{
   
    amt = req.body.amt;

    console.log(req.body)

    const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "http://128.199.25.86:5008/success",
          "cancel_url": "http://128.199.25.86:5008/cancel"
      },
      "transactions": [{
          "item_list": {
              "items": req.body.itemlist
          },
          "amount": {
              "currency": "INR",
              "total": amt
          },
          "description": "Hat for the best team ever"
      }]
  };
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        for(let i = 0;i < payment.links.length;i++){
          if(payment.links[i].rel === 'approval_url'){
            res.redirect(payment.links[i].href);
          }
        }
    }
  });
  
  }

  const success = (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    console.log("payerId",payerId,"paymentId",paymentId) 
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "INR",
              "total": amt
          }
      }]
    };
  
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log("error",error.response);
          throw error;
      } else {
          res.sendFile(__dirname + "/success.html")
      }
  });
}

const cancel = (req,res)=>{
    return res.send('Cancelled')
}



module.exports = {
    pay,
    success,
    cancel
  };
  