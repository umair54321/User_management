const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String
    },
    
 },{
    timestamps:true
 });

 module.exports = mongoose.model('staff', addressSchema);