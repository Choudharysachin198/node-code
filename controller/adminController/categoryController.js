const express=require('express');
const categoryDB=require('../../models/categoryList.model.js');
const img=require('../../config/db.js');
const {
    success,
    errorResponse,
    successWithData,
    validationError,
    notFound
} = require('../../helpers/apiResponse');
var fs = require('fs');
var path = require('path');
const multer = require('multer');

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
}).single('category_logo');


module.exports={
    uploadImg,
createCategory: async function (req, res) {
        try {
            const category_name = req.body.category_name
            const category_logo = req.file.path
            //console.log('abc',category_logo)
           // console.log('img', img.imgUrl)
           if (!(category_name != '' && category_logo != '')) {
                return validationError(res, 'Require All Fields');
            }
            const Oldcategory = await categoryDB.findOne({
                category_name
            }).lean();
            if (Oldcategory) {
                return success(res, "Category Already Exist");
            } else {
                if (Oldcategory == null) {
                    const user = await categoryDB.create({
                        category_name,
                        //category_logo
                    })
                    //console.log("category_logo", category_logo)
                    var imagename = category_logo.split('/');
                    // console.log("imagename",imagename);
                    user.category_logo = img.imgUrl + imagename[2],

                        user.category_name = req.body.category_name,
                        user.status=1
                        //console.log('xyz',category_logo);
                    await user.save((err, doc) => {
                        if (err) {
                            return errorResponse(res, 'Please Try Again')
                        } else {
                            return success(res, 'Data Submitted Successfully')
                        }
                    });
                }else{
                    return errorResponse(res,'Error while enter Category');
                }
            }
        } catch (err) {
            console.log(err);
        }
    },
    //---------------------------------------------------update---------------------------------------------//
    updateCategory: async function (req, res) {
        try {
            const category_name = req.body.category_name
            const category_logo = req.file.path


            if (!(category_name && category_logo)) {
                return validationError(res, 'Required All Fields')
            }
            const {
                id
            } = req.body;
            var _id = id;
            const updatedData = await categoryDB.findById({
                _id
            }).select({_id:1}).lean();
             //console.log('update', updatedData);
            if (updatedData) {
                var imagename1 = category_logo.split('/');
                var newvalues = {
                    $set: {
                        category_name: category_name,
                        category_logo: img.imgUrl + imagename1[2],
                    }
                }
                categoryDB.updateOne(updatedData,newvalues, (err, doc) => {
                    if (err) {
                        return errorResponse(res, 'Error While Updating Category ')
                    } else {
                        return successWithData(res, 'Category Successfully Updated', doc);
                    }
                })
            } else {
                return errorResponse(res, 'Category Not Updated');
            }
        } catch (err) {
            console.log(err);
        }
    },
    // --------------------------------------------get----------------------------------------------------//
    getAllCategory: async function (req, res) {
        try {
             categoryDB.find(function (err, doc) {
                if (err) {
                    return notFound(res,'Please Try Again')
                } else {
                    if(doc.length > 0){
                    return successWithData(res, 'Data Found Successfully', doc)
                }else{
                    return errorResponse(res, 'Data Not Found')
                }
                }
            })
        } catch (err) {
            console.log(err);
        }
    },



    ///////////////-------------------------view category----------------//
     viewCategory: async function (req, res) {
        try {
            const{id}=req.body;
            var _id=id;
            const viewData=await categoryDB.findById({_id});
            if(viewData){
                return successWithData(res,'Data Successfully Found',viewData)
            }else{
                return errorResponse(res,'Data Not Found');
            }
           
            
        } catch (err) {
            console.log(err);
        }
    },



    //-------------------------------------------------DELETE---------------------------------------------------//
    deleteCategory: async function (req, res) {
        try{
      const {
            id
        } = req.body;
        var _id = id;
        const deletedData = await categoryDB.findById({
            _id
        }).lean();
        //console.log('delete',deletedData);
        if (deletedData) {
          categoryDB.deleteOne(deletedData,(err, doc) => {
                if (err) {
                    return errorResponse(res, "Please Try Again");
                } else {
                    return success(res, "Data Successfully Deleted");
                }
            })
        }else{
            return notFound(res,'Data Not Found');
        }
    }catch(err){
        console.log(err);
    }
    },

     updateCategoryStatus: async function (req, res) {
        try {
            var status = '';
            if (req.body.status == 1) {
                status = 0;
            } else {
                status = 1;
            }
            var newvalues = {
                $set: {
                    status: status
                }
            }
            categoryDB.updateOne({
                _id: req.body.id
            }, newvalues, (err, doc) => {
                if (err) {
                    return errorResponse(res, "Error While Updating Status");
                } else {
                    return successWithData(res, 'Successfully Updated Status', doc)
                }
            })
        } catch (err) {
            console.log(err);
        }
    },

    // updateCategoryStatus: async function(req,res){
    //     try{
    //         const{id}=req.body;
    //         var _id=id
    //         const statusData= await categoryDB.findById({
    //             _id
    //         }).select({status:1});
    //         if(statusData){
    //             console.log('abc',statusData);
    //             var status='';

    //             if(statusData.status==1){
    //                 status = 0;
    //             }else{
    //                 status = 1;
    //             }
    //             console.log('status',status);
    //             if(status!= "" || status != null || status != undefined){
    //                 var newvalues={
    //                     $set:{
    //                         status:status
    //                    }
    //                 }
    //                 //console.log('newvalues',newvalues);
    //                 categoryDB.updateOne(statusData,newvalues,(err,doc)=>{
    //                     if(err){
    //                         return errorResponse(res,"Error While Updating Status");
    //                     }else{
    //                         return successWithData(res,'Successfully Updated Status',statusData)
    //                     }
    //                     //console.log('doc',doc);
    //                })
    //             }
    //       }
    //    }catch(err){
    //            console.log(err);
    //     }
    // },

    GetCategoryById: async function(req,res){
        try{
            const{id}=req.body;
            var _id=id;
            const getCategory=await categoryDB.findById({_id});
            if(getCategory){
                return successWithData(res,'Successfully Get Data',getCategory)
            }else{
                return errorResponse(res,'Data Not Found');
            }

        }catch(err){
            console.log(err)
        }
    }
}