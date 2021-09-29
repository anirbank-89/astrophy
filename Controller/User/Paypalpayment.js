var mongoose = require("mongoose");
const paypal = require('paypal-rest-sdk');

// paypal.configure({
//     'mode': 'live', //sandbox or live
//     'client_id': 'ASj4FIWjwrH0Dr2Qaqv-djJju0tcGJtdSuZUmyGdLBR1EZPymeqQW77qU7qImEg_CNV9T8wY4VJF00mC',
//     'client_secret': 'EL3JDbjdtmHLf7tdhz3ae66fgqqiP2oXXcqjuxGJ-VF656AA7_NsFBdARMb0qaLHgnjWzEz55HyomK4_'
//   });

  paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'ARqzRnPyToy4PkQLCLzh2LSujG13HZSkSvvUIEzQ42kPeY1JDqGuLYgAEQBPpZJncE2_nuoU_EBK6L1D',
    'client_secret': 'ELCDHAE-xkX1MRFlrcxtEtak_FpRR5FFomx2Lj0u6ExwoKoUvBZcuwbZRm2hfAPiG8nAB1jVcu2d5Th2'
  });

  var amt = null;

const pay = async(req,res)=>{    

    // const data = JSON.parse(req.body.itemlist)
    // console.log(data.itemlist);

    amt = req.params.amt;
    // return false

    const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "http://128.199.25.86:5008/v1/user/paypalsuccess",
          "cancel_url": "http://128.199.25.86:5008/v1/user/paypalcancel"
      },
      "transactions": [{
          "item_list": {
              "items": []
          },
          "amount": {
              "currency": "USD",
              "total": amt
          },
          "description": "Hat for the best team ever"
      }]
  };
  // return res.send(create_payment_json)
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
              "currency": "USD",
              "total": amt
          }
      }]
    };
  
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log("error",error.response);
          throw error;
      } else {
          // res.sendFile(__dirname + "/success.html")
          res.sendFile("/var/www/html/astrophyBack/success.html")

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
  