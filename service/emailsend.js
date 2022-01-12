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

var grievance = async (email) => {
  var emailTemplate =
    '<p>' +
    ' Thank you for contacting us. We have received you grievance and we will be taking a look. We will get back to you shortly.' +
    '</p>' +
    '<br />' +
    '<p>' + 'Team Astrophy' + '</p>'

  let data = {
    to: email,
    message: emailTemplate,
    subject: "User grievance mail.",
  }

  superagent
    .post('https://new.easytodb.com/astrophymail/semdmail.php')
    .send(data)
    .set('Content-Type', 'application/json')
    .end((err,info) => {
      if (!err) {
        console.log("Email sent: ", info);
      }
      else {
        console.log(err.message);
      }
    });
}

module.exports = {
  verification,
  grievance
}