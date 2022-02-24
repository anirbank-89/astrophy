var superagent = require('superagent');

var verification = async (name, email) => {
  // var emailTemplate =
  //       '<p>' +
  //       'Welcome to Astrophy !' +
  //       '</p>' +
  //       '<br />' +
  //       '<p>' +
  //       ' Thank you for registering. To complete the registration process, please click on the link below to verfy your email - ' +
  //       '</p>'+
  //       '<br />'+
  //       '<p>'+'http://astrophy.com/email-verification/'+'</p>'+'<br />'+
  //       '<p>'+'Thanks,'+'</p'+
  //       '<p>'+'Team TesData'+'</p>'


  let data = {
    url: 'http://localhost:3000/after-verify',
    to_email: email,
    to_name: name
  };

  superagent
    .post('https://new.easytodb.com/astrophymail/semdmail.php')
    .send(data) // sends a JSON post body
    .set('Content-Type', 'application/json')
    .end((err, info) => {
      if (err) {
        console.log(err);
        // return err;
      }
      else {
        console.log("Email info: ", info);
        //   return info;
      }
    });
};

function replyToContact(reply,user_mail) {
  var emailTemplate =
    '<p>' +
    'Hi ' + 
    '</p>' +
    '<p>' + 
    reply + 
    '</p>' + 
    '</br>' + 
    '<p>' + 
    'Thanking you,' + 
    '</p>' + 
    '<p>' + 
    'Team Astrophy' + 
    '</p>'

  let data = {
    to: user_mail,
    message: emailTemplate,
    subject: "Astrophy - Reply to contact"
  }

  superagent
    .post('https://new.easytodb.com/astrophymail/semdmail.php')
    .send(data) // sends a JSON post body
    .set('Content-Type', 'application/json')
    .end((err, info) => {
      if (err) {
        console.log(err);
        // return err;
      }
      else {
        console.log("Email info: ", info);
        //   return info;
      }
    });
}

function queries(rciv_mail, user_email, question, addn_detail) {
  var emailTemplate =
    '<p>' +
    'Received from: ' + user_email +
    '</p>' +
    '<br />' +
    '<p>' +
    'Question: ' + question +
    '</p>' +
    '<br />' +
    '<p>' +
    'Additional_details: ' + addn_detail +
    '</p>'

  let data = {
    to: rciv_mail,
    message: emailTemplate,
    subject: "User queries"
  }

  superagent
    .post('https://new.easytodb.com/astrophymail/semdmail.php')
    .send(data) // sends a JSON post body
    .set('Content-Type', 'application/json')
    .end((err, info) => {
      if (err) {
        console.log(err);
      }
      else {
        console.log("Email info: ", info);
      }
    });
}

function buyerOrderConfirmation(order_info, serv_info, user_email) {
  var template =
    '<p>' +
    'Hi ' + order_info.firstname + ',' +
    '</p>' +
    '<br /><br />' +
    '<p>' +
    'This is confirmation mail for your service request at ' + serv_info.servicename + ' (order id: ' + order_info.order_id + '). Payment of ' + order_info.total + ' has already been made.' +
    '<br />' +
    'Please be availabe on the requested service date.' +
    '</p>' +
    '<br /><br />' +
    '<p>' +
    'Thanking you,' +
    '<br />' +
    'Team Astrophy' +
    '</p>'

  let data = {
    to: user_email,
    message: template,
    subject: "Astrophy service order " + order_info.order_id
  }

  superagent
    .post('https://new.easytodb.com/astrophymail/semdmail.php')
    .send(data)  // sends a JSON post body
    .set('Content-Type', 'application/json')
    .end((err, info) => {
      if (err) {
        console.log(err);
      }
      else {
        console.log("Email info: ", info);
      }
    });
}

module.exports = {
  verification,
  replyToContact,
  queries,
  buyerOrderConfirmation
}