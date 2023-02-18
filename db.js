const mongoose = require('mongoose');



const mongoURI = 'mongodb://127.0.0.1:27017/user-management';

const connectMongo = ()=>{
    mongoose.connect(mongoURI,()=>{
        console.log("Connected Mongodb successfully");
    })
}

// const mongoConnect = ()=>{
//     mongoose.connect("mongodb://localhost:27017/user-management",{
//     useCreateIndex:true,
//     useNewUrlParser:true,
//     useUnifiedTopology:true
// }).then(()=>{
//     console.log("Connection successfully")  ;
// }).catch(()=>{
//     console.log("No connection");
// });
// }

module.exports = connectMongo;