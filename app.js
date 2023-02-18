
const express = require('express');
const mongoConnect = require('./db');
const app = express();
const ejs = require('ejs');
const mongooseConnect = require('./db')

mongoConnect();

// for user route
const route = require('./routes/userRoute');
app.use('/',route);

// for user route
const adminRoute = require('./routes/adminRoute');
const testingRoute = require('./routes/testingRoute');
app.use('/admin',adminRoute);
app.use('/testing',testingRoute);



app.listen(3000,()=>{
    console.log('Server is running......');
})