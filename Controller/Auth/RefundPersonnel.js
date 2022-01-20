const { Validator } = require('node-input-validator')

const REFUND_PERSONNEL = require('../../Models/refund_personnel')

var login = async(req,res) =>
{
    const V = new Validator(req.body,{
        email:'required|email',
        password:'required'
    })
    let matched = await V.check().then((val)=>val)
    if(!matched)
    {
        return res.status(401).json({
            status:false,
            error: v.errors
        })
    }

    REFUND_PERSONNEL.findOne({email:req.body.email})
        //   .exe()
          .then(admin =>{
                if(admin!=null && admin!='' && admin.length < 1 )
                {
                    return res.status(401).json({
                            status: false,
                            message: 'Server error. Please try again.',
                            error: 'Server Error',
                        });
                }
                if(admin!=null && admin!='' && admin.comparePassword(req.body.password))
                {
                    return res.status(200).json({
                        status: true,
                        message: 'Personnel login successful',
                        data: admin
                    });
                }
                else
                {
                    return res.status(200).json({
                        status: false,
                        message: 'Invalid Email or Password !!. Please try again.',
                        error: 'Invalid Email or Password !!',
                    });
                }
            }

          )
}

module.exports = {
    login
}