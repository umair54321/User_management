const express = require('express');
const adminRoute = express();

const session = require('express-session');
const config = require('../config/config');
adminRoute.use(session({secret:config.sessionSecret,resave: true, saveUninitialized: true}));

const bodyParser = require('body-parser');
adminRoute.use(bodyParser.json());
adminRoute.use(bodyParser.urlencoded({extended:true}));

adminRoute.set('view engine','ejs');
adminRoute.set('views','./views/admin');

const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../Public/userImage'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name)
    }
})
const upload = multer({storage:storage});

const auth = require('../middleware/adminAuth')

const adminController = require('../controller/adminController');

adminRoute.get('/',auth.isLogout,adminController.loginLoad);
adminRoute.post('/',adminController.verifyLogin);
adminRoute.get('/home',auth.isLogin,adminController.loadAdminHome);
adminRoute.get('/logout',auth.isLogin,adminController.logout);
adminRoute.get('/forget',auth.isLogout,adminController.forgetLoad);
adminRoute.post('/forget',adminController.forgetVerify);
adminRoute.get('/forget-password',adminController.forgetadminpasswordLoad);
adminRoute.post('/forget-password',adminController.resetPassword);
adminRoute.get('/dashboard',auth.isLogin,adminController.adminDashboard);
adminRoute.get('/addnewUser',auth.isLogin,adminController.addUser);
adminRoute.post('/addnewUser',upload.single('image'),adminController.adduserPost);
adminRoute.get('/editUser',auth.isLogin,adminController.editUserLoad);
adminRoute.post('/editUser',adminController.updateUsers);
adminRoute.get('/deleteUser',auth.isLogin,adminController.deleteUser);
adminRoute.get('/exportUsers',auth.isLogin,adminController.exportUsersData);
adminRoute.get('/exportUsersPdf',auth.isLogin,adminController.exportUsersDataPdf)
adminRoute.get('*',function(req,res){
    res.redirect('/admin')
});


module.exports = adminRoute;