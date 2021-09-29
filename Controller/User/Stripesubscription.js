var mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const stripe = require("stripe")(process.env.STRIPE_TEST);
var SubscribedBy = require("../../Models/subscr_purchase");

const create_payment = async(req,res)=>{
  const { card, billing_details } = req.body;
  const paymentMethod = await stripe.paymentMethods.create({
    type: "card",
    card: card,
    billing_details: billing_details,
  });
  console.log('paymentMethod',paymentMethod);
  return res.send(paymentMethod);
}

const subs_new = async (req, res) => {
    const { email, payment_method, plan_id } = req.body;
    // console.log(req.body);
    const customer = await stripe.customers.create({
      payment_method: payment_method,
      email: email,
      invoice_settings: {
        default_payment_method: payment_method,
      },
    });
    console.log('customer',customer)
  
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ plan: plan_id }],
      expand: ["latest_invoice.payment_intent"],
    });
    console.log('subscription',subscription)
  
    if (subscription) {
      // console.log("subscription", subscription);
      let status = "";
      let client_secret = "";
  
      if (subscription["latest_invoice"]["payment_intent"] != null) {
        status = subscription["latest_invoice"]["payment_intent"]["status"];
        client_secret =
          subscription["latest_invoice"]["payment_intent"]["client_secret"];
      }
  
      const paymentData = subscription;
  
      res.json({
        client_secret: client_secret,
        status: status,
        paymentData: paymentData,
        error: false,
      });
    } else {
      res.json({
        client_secret: null,
        status: "",
        paymentData: null,
        error: true,
      });
    }
  }

const subsretrive = async (req, res) => {

      const { subs_id } = req.body;
      const subscription = await stripe.subscriptions.retrieve(subs_id)

      if (subscription) {
        let latest_invoice = subscription.latest_invoice;
        let endData = new Date(subscription.current_period_end);
        let startData = new Date(subscription.current_period_start);
  
        var date = new Date(endData * 1000);
        var datenew = new Date(startData * 1000);
        const paymentData = subscription;
  
        res.json({
          endDate: date,
          startData: datenew,
          subsData: paymentData,
          error: false,
        });
      } else {
        res.json({
          endDate: "",
          startData: "",
          subsData: null,
          error: true,
        });
      }
    }


const subcancel = async (req, res) => {

          const { subs_id,sub_id } = req.body;
          const subscription = await stripe.subscriptions.del(subs_id)
          if (subscription) {
            let latest_invoice = subscription.latest_invoice;
            let endData = new Date(subscription.current_period_end);
            var date = new Date();
            const paymentData = subscription;
            // let key = { user_id: Number(req.user.id), id: sub_id };
            // console.log('key',key);
            let update = { overdate: date, status: false };
            let userSubsUpdate = await SubscribedBy.findOneAndUpdate(
                {_id: {$in: [mongoose.Types.ObjectId(sub_id)]}},
                update
              );
            return res.send({
                status:true,
                data:userSubsUpdate,
                error:null
            });
          } else {
            return res.json({
              endDate: "",
              subsData: null,
              error: true,
            });
          }
        }
      
  


module.exports = {
    create_payment,
    subs_new,
    subsretrive,
    subcancel
  };