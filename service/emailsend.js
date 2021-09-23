var superagent = require('superagent');

var verification = async (name,email)=>{
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
        url:'http://localhost:3000/after-verify',
        to_email: email,
        to_name: name
    };
    
    superagent
      .post('https://new.easytodb.com/astrophymail/semdmail.php')
      .send(data) // sends a JSON post body
      .set('Content-Type', 'application/json')
      .end((err,info)=>{
          if (err) {
            console.log(err);
            // return err;
          }
          else {
              console.log("Email info: ",info);
            //   return info;
          }
      });
};

module.exports = {
    verification
}