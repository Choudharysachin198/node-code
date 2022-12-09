const express = require('express');
const router = express.Router();

const admin_controller = require('../controller/adminController/adminAuthController.js');
const category_controller = require('../controller/adminController/categoryController.js');
const privacy_controller=require('../controller/adminController/privacyController.js');
const contact_controller=require('../controller/adminController/contactUsController.js');
const count_controller=require('../controller/adminController/countController.js');


/* auth section routes */
router.post('/addAdmin', admin_controller.addAdmin);
router.post('/adminSignIn', admin_controller.adminSignIn);
router.post('/register', admin_controller.register);
router.post('/login', admin_controller.login);
router.post('/create', admin_controller.create);
router.get('/test', admin_controller.test);

/* category section routes */
router.post('/createCategory',category_controller.uploadImg,category_controller.createCategory);
router.post('/updateCategory',category_controller.uploadImg,category_controller.updateCategory);
router.post('/deleteCategory',category_controller.uploadImg,category_controller.deleteCategory);
router.post('/updateCategoryStatus',category_controller.updateCategoryStatus);
router.get('/getAllCategory',category_controller.getAllCategory)
router.post('/viewCategory',category_controller.viewCategory)
router.post('/GetCategoryById',category_controller.GetCategoryById);

/* terms And conditions routes */
router.post('/termsAndConditions',privacy_controller.termsAndConditions);
router.post('/updateTerms',privacy_controller.updateTerms);
router.post('/deleteTerms',privacy_controller.deleteTerms);
router.get('/getAllTerms',privacy_controller.getAllTerms);

/* Contact-us routes */
router.post('/createContact',contact_controller.createContact);
router.get('/getAllContact',contact_controller.getAllContact);

/* Count routes */
router.get('/countCategory',count_controller.countCategory);
router.get('/countUser',count_controller.countUser);


module.exports = router;
