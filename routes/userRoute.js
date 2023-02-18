const express = require('express');
const route = express();

const session = require('express-session');
const config = require('../config/config')
route.use(session({secret:config.sessionSecret,resave: true, saveUninitialized: true}));

const auth = require('../middleware/auth');

route.use(express.static('public'));

route.set('view engine','ejs')
route.set('views','./views/users');

const bodyParser = require('body-parser');
route.use(bodyParser.json());
route.use(bodyParser.urlencoded({extended:true}));

const multer = require('multer');
const path = require('path')
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../Public/userImage'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name)
    }
})
const upload = multer({storage:storage})

const userController = require('../controller/userController');

route.get('/register',auth.isLogout,userController.loadRegister);
route.post('/register',upload.single('image'),userController.insertUser);
route.get('/verify',userController.verifyMail);
route.get('/',auth.isLogout,userController.loginLoad);
route.get('/login',auth.isLogout,userController.loginLoad);
route.post('/login',userController.verifyLogin);
route.get('/home',auth.isLogin,userController.loadHome);
route.get('/logout',auth.isLogin,userController.userLogout)
route.get('/forget',auth.isLogout,userController.userForget);
route.post('/forget',userController.forgetVerify);
route.get('/forget-password',auth.isLogout,userController.forgetpasswordLoad);
route.post('/forget-password',userController.resetPassword);
route.get('/verification',userController.verificationLoad);
route.post('/verification',userController.sentVerificationMailLink);
route.get('/edit',auth.isLogin,userController.editLoad);
route.post('/edit',upload.single('image'),userController.updateProfile)

module.exports = route;