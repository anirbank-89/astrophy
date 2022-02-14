const { Validator } = require('node-input-validator');

const PROBLEM = require('../../Models/user_problems');

var reportProblem = async (req,res) => {
    const V = new Validator(req.body, {
        desc: 'required'
    });
    let matched = await V.check().then(val => val);

    if (!matched) {
        return res.status(400).json({ status: false, errors: V.errors });
    }

    const NEW_PROBLEM = new PROBLEM(req.body);

    return NEW_PROBLEM.save()
        .then(docs => {
            res.status(200).json({
                status: true,
                message: "Thank you for reaching out to us. We will get back to you shortly.",
                data: docs
            });
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: "Failed to add report. Server error.",
                error: err
            });
        });
}

module.exports = {
    reportProblem
}