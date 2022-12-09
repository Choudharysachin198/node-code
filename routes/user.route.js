const express=require('express');
const usercontroller = require('../controller/userController/authController.js');
const router=express.Router();
router.post('/signup',usercontroller.signup);
router.post('/login',usercontroller.login);
router.post('/verifyOtp',usercontroller.VerifyOtp);
router.post('/resendOtp',usercontroller.ResendOtp);
router.post('/updateProfile',usercontroller.uploadImg,usercontroller.updateProfile);
router.get('/getAllData',usercontroller.getAllData);




module.exports=router;