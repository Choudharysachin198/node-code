const adminDB = require('../../models/Admin.model');
var jwt = require('jsonwebtoken');
var config = require('../../config/db.js');
const { errorResponse, successWithData, validationError, notFound } = require('../../helpers/apiResponse');
var adminService = require('../../services/adminService');
console.log("Admin controller here...");
module.exports = {
    test: function (req, res) { 
        console.log('Test function call..');
    },
    //--------------------------add admin-------------------    
    addAdmin: function (req, res) {
        if (req.body.admin_email != '' && req.body.admin_password != '') {

            var where = {
                admin_email: req.body.admin_email
            };

            adminDB.findOne(where, function (err, emailfound) {
                if (emailfound != null) {
                    return errorResponse(res, 'Email Already Exist!')
                } else {
                    let Admin = new adminDB();
                    Admin.admin_email = req.body.admin_email;
                    Admin.admin_password = req.body.admin_password;
                    Admin.status = 1;
                    Admin.save((err, doc) => {
                        if (err) {
                            return errorResponse(res, err)
                        } else {
                            var token = jwt.sign({
                                id: doc._id
                            }, config.secret, {
                                expiresIn: 86400 // expires in 24 hours
                            });
                            Admin.jwtToken = token;
                            Admin.save(function (err) {
                                if (err) {
                                    res.send({
                                        'code': 400,
                                        'result': err.message,
                                        'message': "Please Try Again!",
                                    });
                                } else {
                                    return successWithData(res, 'Successfully Sign Up New Admin', token)
                                }
                            });
                        }
                    });
                }
            })

        } else {
            return validationError(res, 'Please Fill All Required Fields')
        }
    },

    //--------- Admin Sign IN ----------------
    adminSignIn: function (req, res) {
        if (req.body.admin_email != '' && req.body.admin_password != '') {
            var where = {
                'admin_email': req.body.admin_email,
                'admin_password': req.body.admin_password
            }
            adminDB.find(where, (err, docs) => {
                if (docs.length > 0) {
                    //console.log(docs[0]._id);
                    var token = jwt.sign({
                        id: docs[0]._id
                    }, config.secret, {
                        expiresIn: 86400 // expires in 24 hours
                    });
                    var newvalues = {
                        $set: {
                            'jwtToken': token,
                        }
                    };
                    adminDB.updateOne(where, newvalues, function (err, doc) {
                        if (err) {
                            res.send({
                                "code": 400,
                                "result": err,
                                "message": "Not Update Token. Error while login!!!!"
                            });
                        } else {
                            res.send({
                                "code": 200,
                                "result": docs,
                                "data": doc,
                                "message": "Admin Login Successfully"
                            });
                        }
                    });
                } else {
                    res.send({
                        "code": 400,
                        "result": err,
                        "message": "Invalid Credentials"
                    });
                }
            });
        } else {
            res.send({
                "code": 400,
                "result": '',
                "message": "Please Fill All Required Fields"
            });
        }
    },

    register: async function (req, res) {
        try {
            const { admin_email, admin_password } = req.body;
            // Validate user input
            if (!(admin_email && admin_password)) {
                return validationError(res, 'Please Fill All Required Fields')
            }
            // check if user already exist
            // Validate if user exist in our database
            const oldUser = await adminDB.findOne({ admin_email });

            if (oldUser) {
                return errorResponse(res, 'Email Already Exist!')
            }

            //Encrypt user password
            //encryptedPassword = await bcrypt.hash(password, 10);

            // Create user in our database
            const user = await adminDB.create({
                admin_email: admin_email, // sanitize: convert email to lowercase
                admin_password: admin_password,
                status: 1
            });

            // Create token
            var token = jwt.sign({
                id: user._id
            }, config.secret, {
                expiresIn: 86400 // expires in 24 hours
            });
            // save user token
            user.jwtToken = token;

            const updateToken = await adminDB.updateOne({ admin_email }, { jwtToken: user.jwtToken });

            // return new user
            if (updateToken) {
                return successWithData(res, 'Successfully Sign Up New Admin', user)
            }

        } catch (err) {
            console.log(err);
        }

    },

    login: async function (req, res) {

        // Our login logic starts here
        try {
            // Get user input
            const { admin_email, admin_password } = req.body;

            // Validate user input
            if (!(admin_email && admin_password)) {
                return validationError(res, 'Please Fill All Required Fields')
            }
            // Validate if user exist in our database
            const user = await adminDB.findOne({ admin_email, admin_password }).lean();

            //if (user && (await bcrypt.compare(password, user.password))) {
            if (user) {
                // Create token
                // const token = jwt.sign(
                //   { user_id: user._id, email },
                //   process.env.TOKEN_KEY,
                //   {
                //     expiresIn: "2h",
                //   }
                // );

                var token = jwt.sign({
                    id: user._id, admin_email
                }, config.secret, {
                    expiresIn: 86400 // expires in 24 hours
                });

                // save user token
                user.jwtToken = token;
                //console.log("token", user.jwtToken)

                const updateToken = await adminDB.updateOne({ admin_email }, { jwtToken: user.jwtToken });

                // user
                if (updateToken) {
                    return successWithData(res, 'Successfully login', user)
                }

            }
            return errorResponse(res, 'Invalid Credentials')
        } catch (err) {
            console.log(err);
        }


    },

    create: function (req,res){
        return adminService.Create(req);
    
    }


}

// exports.create = (req, res) => {
//     const result = adminService.Create(req);
//     console.log("result", result);
// };