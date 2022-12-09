const mongoose=require('mongoose')
const signSchema=mongoose.Schema({
    profile_image:{type:String},
    firstname:{type:String},
    lastname:{type:String},
    email:{type:String},
    password:{type:String},
    jwttoken:{type:String},
    otp:{type:String},
    type:{type:String},
    contact:{type:Number},
    gender:{type:String},
    status:{type:String},
    Created_at:{type:Date, default:Date.now},
    updated_at:{type:Date, default:Date.now}
})
module.exports=mongoose.model('signups',signSchema);