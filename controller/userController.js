const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer')
const randomstring = require('randomstring');
const config = require('../config/config');


const secPassword = async(password)=>{
    try{
        const passHash = await bcrypt.hash(password,10)
        return passHash;
    }
    catch(err){
        console.log(err);
    }
}

const sendVerifyEmail = (name,email,user_id)=>{
    try{
        const transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:config.userEmail,
                pass:config.userPassword
            }
        });
        const mailOption = {
            from: config.userEmail,
            to:email,
            subject:'For verification mail',
            html: '<p>Hii '+name+',please click here to <a href="http://127.0.0.1:3000/verify?id='+user_id+'"> Verify </a> your mail'           
        }
            transporter.sendMail(mailOption,(error,info)=>{
                if(error){
                    console.log(error);
                }else{
                    console.log("Email has been sent",info.response);
                }
            })
    }
    catch(error){
        console.log(error.message);
    }
}


// reset password function
const sendResetpasswordEmail = (name,email,token)=>{
    try{
        const transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:config.userEmail,
                pass:config.userPassword
            }
        });
        const mailOption = {
            from: config.userEmail,
            to:email,
            subject:'For Reset Password',
            html: '<p>Hii '+name+',please click here to <a href="http://127.0.0.1:3000/forget-password?token='+token+'"> Reset </a> your password</p>  '         
        }
        transporter.sendMail(mailOption,(error,info)=>{
            if(error){
                console.log(error);
            }else{
                console.log("Email has been sent",info.response);
            }
        })
    }
    catch(error){
        console.log(error.message);
    }
}



// routing sections
const loadRegister = async(req,res)=>{
    try {
        res.render('registration')
    } catch (error) {
        console.log(error);
    }
    
}

const insertUser = async(req,res)=>{
    try{
        const sPassword = await secPassword(req.body.password)
        const user = new User({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mno,
            image:req.file.filename,
            password:sPassword,
            is_admin:0
        });
        const userData = await user.save();
        if(userData){
            sendVerifyEmail(req.body.name,req.body.email,userData._id);
            res.render('registration',{message:"your registration has been successfull"})
        }else{
            res.render('registration',{message:"your registration has failed"})
        }
    } catch(error){
        console.log(error);
    }
}

const verifyMail = async(req,res)=>{
    try {
        const updateInfo = await User.updateOne({_id:req.query.id},{$set:{is_verified:1}});
        res.render("tes")
    } catch (error) {
        console.log(error);
    }
}

// Login user method
const loginLoad = async(req,res)=>{
    try {
        res.render('login',{title:'login form',name:'umair'})
    } catch (error) {
        console.log(error);
    }
}
// Verify Login User
const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({email:email});
        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password);
            if(passwordMatch){
                if(userData.is_verified === 0){
                    res.render('login',{title:'login form',message:'Please verify your email'});
                }
                else{
                    req.session.user_id = userData._id; 
                
                    res.redirect('/home');
                }
            }
            else{
                res.render('login',{message:'Please use correct credential'});
            }
        }
        else{
            res.render('login',{message:'Please use correct credential'});
        }
    } catch (error) {
        console.log(error);
    }
}

const loadHome = async(req,res)=>{
    try {
        const userData = await User.findById({_id:req.session.user_id})

        res.render('home',{user:userData})
    } catch (error) {
        console.log(error);
    }
}

const userLogout = async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/'); 
    } catch (error) {
        console.log(error);
    }
}

const userForget = async(req,res)=>{
    try {
        res.render('forget')
    } catch (error) {
        console.log(error.message);
    }
}

const forgetVerify = async(req,res)=>{
    try {
        const email = req.body.email;
        const userData = await User.findOne({email});
        if(userData){
            
            if(userData.is_verified === 0){
                res.render('forget',{message:"please verfiy your mail"})
            }
            else{
                const randomString =  randomstring.generate();
                const updatedData = await User.updateOne({email:email},{$set:{ token:randomString }});
                sendResetpasswordEmail(userData.name,userData.email,randomString);
                res.render('forget',{message:"please check your mail to reset your password"})
            }
        }
        else{
            res.render('forget',{message:"User email is incorrect"});
        }
    } catch (error) {
        console.log(error);
    }
}
const forgetpasswordLoad = async(req,res)=>{
    try {       
       const token = req.query.token;
       
       const tokenData = await User.findOne({token:token})      
        if(tokenData){
            res.render('forget-password',{user_id:tokenData._id});
        }
        else{
            res.render('404',{message:"Token is invalid"})
        }
    } catch (error) {
        console.log(error);
    }
}

const resetPassword = async(req,res)=>{
    try {
        const password = req.body.password;
        const user_id = req.body.user_id;

        const seccpassword = await secPassword(password);
        const updateData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:seccpassword,token:''}})
        res.redirect('/');
    } catch (error) {
        console.log(error)
    }
}

const verificationLoad = async(req,res)=>{
    try {
        res.render('verification')
    } catch (error) {
        console.log(error);
    }
}

const sentVerificationMailLink = async(req,res)=>{
    try {
        const email = req.body.email;
        const userData =  await User.findOne({email:email});
        if(userData){
            sendVerifyEmail(userData.name,userData.email,userData._id);
            res.render('verification',{message:"Verification mail send your mail Id"});
        }else{
            res.render('verification',{message:'This email is not exist..'})
        }
    } catch (error) {
        console.log(error);
    }
}

const editLoad = async(req,res)=>{
    try {
        const id = req.query.id;
        const userData = await User.findById({_id:id});
        if (userData) {
            res.render('edit',{ user:userData})
        } else {
            res.redirect('/home')
        }
    } catch (error) {
        console.log(error);
    }
}

const updateProfile = async(req,res)=>{
    try {
        if (req.file) {
            const updatedData = await User.findByIdAndUpdate({_id:req.body.user_id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mno,image:req.file.filename}})
        } else {
            const updatedData = await User.findByIdAndUpdate({_id:req.body.user_id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mno}})
        }
        res.redirect('/home')
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadRegister,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    userForget,
    forgetVerify,
    forgetpasswordLoad,
    resetPassword,
    verificationLoad,
    sentVerificationMailLink,
    editLoad,
    updateProfile
}