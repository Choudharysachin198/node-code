const express = require('express');
const signDB = require('../../models/Signup.model.js')
const img = require('../../config/db.js')
const {
    generateotp
} = require('../../services/otp.js')
// const {
//     signToken,
//     verifyToken
// } = require('../services/JWT.js')
// const {
//     message
// } = require('../services/mail.js');
// const {
//     encrypt,
//     compare
// } = require('../services/crypto.js')
const {
    successWithData,
    errorWithData,
    successData,
    validateData,
    notFound,
} = require('../../helpers/apiResponse.js')
const jwt = require('jsonwebtoken');
const multer=require('multer');
const sgmail = require('@sendgrid/mail');
const fs = require('fs');
const {
    where
} = require('../../models/Signup.model.js');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../uploads', );
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const uploadImg = multer({
    storage: storage
}).single('profile_image');


module.exports = {
    uploadImg,
       signup: async function (req, res) {
        try {

            const {
                firstname,
                lastname,
                email,
                password,
                gender,
                profile_image,
                contact,
                type
            } = req.body;
            if (!(firstname && lastname && email && password && type)) {
                return validateData(res, "required all fields");
            }
            const Olduser = await signDB.findOne({
                email
            }).lean();

            if (Olduser) {
                return successData(res, "Email Already Exist");
            } else {
                //const hashedPassword = await encrypt(password);

                const otpGenerated = generateotp();
                //console.log('otp', otpGenerated);
                if (otpGenerated) {
                    var reqType;
                    if (req.body.type == "user") {
                        reqType = "user"
                    } else {
                        reqType = "stylist"
                    }
                    if (reqType) {
                        const user = await signDB.create({
                            firstname: firstname,
                            lastname: lastname,
                            email: email,
                            password: password,
                            contact: '',
                            profile_image: '',
                            gender: ''

                        })
                        var token = jwt.sign({
                            id: user._id,
                        }, img.secret, {
                            expiresIn: 86400
                        })
                        user.jwttoken = token;
                        user.otp = otpGenerated
                        user.type = reqType;
                        user.status=1;

                        await user.save((err, doc) => {
                            if (err) {
                                return errorWithData(res, 'error found');
                            } else {
                                if (doc) {
                                    const Apikey = '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';
                                    sgmail.setApiKey(Apikey);

                                    const message = {
                                        to: email,
                                        from: 'mohit.framero@gmail.com',
                                        subject: 'Verify Your OTP',
                                        html: `
                                    <div
                                    class="container"
                                   style="max-width: 90%; margin: auto; padding-top: 20px"
                                  >
                                   <h2>Welcome to Stylish Paizza</h2>
                                    
                                    <p style="margin-bottom: 30px;">Pleas enter the sign up OTP to get started</p>
                                    <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${otpGenerated}</h1>
                                    <p style="margin-top:50px;">If you do not request for verification please do not respond to the mail. You can in turn un subscribe to the mailing list and we will never bother you again.</p>
                                 </div>
                                 `
                                    }
                                    sgmail.send(message)
                                    // console.log('email sent');
                                    return successWithData(res, 'Data Submitted Successfully', doc._id);
                                } else {
                                    console.log('error');
                                }
                            }
                        })
                    }
                }

            }
        } catch (err) {
            console.log('error', err)
        }

    },

    //--------------------------Update Profile ----------------------------//

    updateProfile: async function (req, res) {
       // console.log('abc', 1234);
        try {

            const {
                id,
                firstname,
                lastname,
                email,
                gender,
                contact
            } = req.body
            const 
                profile_image
             = req.file.path
            var _id = id;
            const profile = await signDB.findById({
                _id
            }).select({_id:1}).lean();
            //console.log('abc', profile)
            if (profile) {
                var imagename1 = profile_image.split('/');
                var newvalues = {
                    $set: {
                        firstname: firstname,
                        lastname: lastname,
                        email: email,
                        gender: gender,
                        contact: contact,
                        profile_image: img.imgUrl + imagename1[2],
                        
                    }
                }
               // console.log('values', newvalues);
                signDB.updateOne(profile,newvalues, (err, doc) => {
                    if (err) {
                        return errorResponse(res, 'Please Try Again')
                    } else {
                        return successWithData(res, 'Profile Successfull Updated', doc);
                    }
                })

            } else {
                return notFound(res, "Data Not Found");
            }

        } catch (err) {
            console.log(err);
        }
    },

    ////////////-----------------GetAllData-------------------------//
    getAllData: async function (req, res) {
        try {
            const {
                id
            } = req.body;
            var _id = id;
            const Data = await signDB.findById({
                _id
            }).lean();
            if (Data) {
                return successWithData(res, "Data found");
            } else {

                return errorResponse(res, "Data Not Found");
            }

        } catch (err) {
            console.log(err);
        }
    },

    login: async function (req, res) {
        try {
            const {
                email,
                password
            } = req.body;
            const user = await signDB.findOne({
                email,
                password
            })
            if (user) {
                var token = jwt.sign({
                    id: user._id
                }, img.secret, {
                    expiresIn: 86400
                })
                user.jwttoken = token;
                const updateToken = await user.updateOne({
                    token
                }, {
                    jwtToken: user.jwtToken
                });

                if (updateToken) {
                   // console.log('user',user);
                    return successWithData(res,'Successfully Login', user);
                }
            }

            return errorWithData(res, 'Invalid Crendiatials');
       } catch (err) {
            console.log(err);
        }
    },


    VerifyOtp: async function (req, res) {
        try {
            const {
                id
            } = req.body;
            console.log('id', id);

            var _id = id;
            const user = await signDB.findById({
                _id
            });
          if (user) {
                if (user.otp == req.body.otp) {
                    const updated=await user.updateOne({status:2});
                    if(updated){
                    // return successwithdata(res, 'OTP Matched', user)
                    return successData(res, 'OTP Matched');
                    }else {
                        return errorWithData(res, 'OTP not found');
                } 
                }else{
                    return errorWithData(res,'data not found');
                }

            } else {
                return errorWithData(res, 'User Not Found');
            }
        } catch (err) {
            console.log(err);
        }
    },
    
    ResendOtp: async function (req, res) {
        try {
            const {
                id
            } = req.body;
            //console.log('id', id);
            var _id = id;
            const resend = await signDB.findById({
                _id
            }).lean();
            // console.log('resend',resend);
            if (resend) {
                const otpGenerated = generateotp();
                resend.otp = otpGenerated;
                const updateOtp = await signDB.updateOne({
                    otpGenerated
                }, {
                    otp: resend.otp
                })
                if (updateOtp) {
                    //return successwithdata(res, "successfully updated", resend)
                    const Apikey = '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';
                    sgmail.setApiKey(Apikey);

                    const message = {
                        to: resend.email,
                        from: 'mohit.framero@gmail.com',
                        subject: 'Verify Your OTP',
                        html: `
                                    <div
                                    class="container"
                                   style="max-width: 90%; margin: auto; padding-top: 20px"
                                  >
                                   <h2>Welcome to Stylish Paizza</h2>
                                    
                                    <p style="margin-bottom: 30px;">Pleas enter the sign up OTP to get started</p>
                                    <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${otpGenerated}</h1>
                                    <p style="margin-top:50px;">If you do not request for verification please do not respond to the mail. You can in turn un subscribe to the mailing list and we will never bother you again.</p>
                                 </div>
                                 `
                    }
                    sgmail.send(message)
                   // console.log('email sent');
                    return successWithData(res, 'Data Updated Successfully', resend);
                } else {
                    return errorWithData(res, 'error found');
                }
            } else {
                return errorWithData(res, 'No data found');
            }

        } catch (err) {
            console.log(err);
        }



    }
}