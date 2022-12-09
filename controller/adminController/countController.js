const express=require('express');
const {
    successWithData,
    errorWithData,
    successData,
    validateData,
    notFound,
    errorResponse,
} = require('../../helpers/apiResponse.js')
const categoryDB = require('../../models/categoryList.model.js')
const signDB=require('../../models/Signup.model.js');
//const fs = require('fs');


module.exports={
	countCategory: async function (req, res) {
        try {
            const count = await categoryDB.find({
                status: 1
            }).count();
            if (count) {
                return successWithData(res, 'Data Counted', count);
            } else {
                return errorResponse(res, 'Data not counted');
            }
        } catch (err) {
            console.log(err)
        }
    },

    countUser: async function (req, res) {
        try {
            const count = await signDB.find({
                status: 2
            }).count();
            if (count) {
                return successWithData(res, 'Data Counted', count);
            } else {
                return errorResponse(res, 'Data not counted');
            }
        } catch (err) {
            console.log(err)
        }
    }


}