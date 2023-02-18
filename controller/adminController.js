const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const config = require('../config/config');
const excelJs = require('exceljs');

// Html to pdf generate require things
const ejs = require('ejs');
const pdf = require('html-pdf');
const fs = require('fs');
const path = require('path');
const { response } = require('../routes/adminRoute');


const passwordSecure = async(password)=>{
    try{
        const passHash = await bcrypt.hash(password,10)
        return passHash;
    }
    catch(err){
        console.log(err);
    }
}

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
            html: '<p>Hii '+name+',please click here to <a href="http://127.0.0.1:3000/admin/forget-password?token='+token+'"> Reset </a> your password</p>  '         
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

const addUserMail = (name,email,password,user_id)=>{
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
            subject:'Admin add you and verify your Mail',
            html: '<p>Hii '+name+',please click here to <a href="http://127.0.0.1:3000/forget-password?id='+user_id+'"> Reset </a> your password</p> <br> <b>Email:-</b>'+email+'<br> <b>Password:-</b>'+password+''         
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

const loginLoad = async(req,res)=>{
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async (req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({email:email});
            if(userData){
                    const passwordMatch = await bcrypt.compare(password,userData.password);
                        if(passwordMatch){
                            if(userData.is_admin === 0){
                                res.render('login',{message:"please use correct credentials"});
                            }
                            else{
                                req.session.user_id = userData._id;
                                res.redirect('/admin/home');
                            }
                        }
                        else{
                            res.render('login',{message:"please use correct credentials"});
                        }
            }
            else{
                res.render('login',{message:"please use correct credentials"});
            }
    } catch (error) {
        console.log(error.message);
    }
}
const loadAdminHome = async(req,res)=>{
    try {
        const userData = await User.findById({_id:req.session.user_id})

        res.render('home',{admin:userData})
    } catch (error) {
        console.log(error);
    }
}

const logout = async (req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/admin');
    } catch (error) {
        console.log(error.message);
    }
}

const forgetLoad = async(req,res)=>{
    try {
        res.render('forget');
    } catch (error) {
        console.log(error.message);
    }
}


const forgetVerify = async(req,res)=>{
    try {
        const email = req.body.email;
        const userData = await User.findOne({email:email});
        if(userData){
            if(userData.is_admin === 0){
                res.render('forget',{message:"Email is incorrect"});
            }
            else{
                const randomString = randomstring.generate();
                const updatedData = await User.updateOne({email:email},{$set:{token:randomString}});
                sendResetpasswordEmail(userData.name,userData.email,randomString);
                res.render('forget',{message:"Please check yout mail to reset password"});
            }

        }else{
            res.render('forget',{message:"Email is incorrect"})
        }
    } catch (error) {
        console.log(error.message);
    }
}

 const forgetadminpasswordLoad = async (req,res)=>{
    try {
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
    } catch (error) {
        console.log(error.message);
    }
 }

const resetPassword = async(req,res)=>{
    try {
        const password = req.body.password;
        const user_id = req.body.user_id;
        const securePassword= await passwordSecure(password);
        const updatedData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:securePassword,token:''}});
        res.redirect('/admin');
    } catch (error) {
        console.log(error.message);
    }
}
const adminDashboard = async (req,res)=>{
    try {
        const userData = await User.find({is_admin:0});
        res.render('dashboard',{users:userData});
    } catch (error) {
        console.log(error.message);
    }
}

const addUser = async (req,res)=>{
    try {
        res.render('addnewUser')
    } catch (error) {
        console.log(error);
    }
}

const adduserPost = async (req,res)=>{
    try {
        const name = req.body.name;
        const email = req.body.email;
        const mno = req.body.mno;
        const image = req.file.filename;
        const password = randomstring.generate(8);

        const spassword = await passwordSecure(password);

        const user = new User({
            name:name,
            email:email,
            mobile:mno,
            image:image,
            password:spassword,
            is_admin:0
        });
        const userData = await user.save();
        if(userData){
            addUserMail(name,email,password,userData._id)
            res.redirect('/admin/dashboard')
        }
        else{
            res.render('addnewUser',{message:"something wrong.."})
        }
    } catch (error) {
        
    }
}

const editUserLoad = async (req,res)=>{
    try {
        const id = req.query.id;
        const userData = await User.findById({_id:id});
        if(userData){
            res.render('editUser',{user:userData});
        }
        else{
            res.redirect('/admin/dashboard');
        }
        res.render('editUser');
    } catch (error) {
        console.log(error.message);
    }
}

const updateUsers = async (req,res)=>{
    try {
       const updatedData = await User.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mno,is_verified:req.body.verify}});
        res.redirect('/admin/dashboard')
    } catch (error) {
        console.log(error.message);
    }
}
const deleteUser = async (req,res)=>{
    try {
        const id =req.query.id;
        const deleteData = await User.deleteOne({_id:id});
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.log(error.message);
    }
}

const exportUsersData = async(req,res)=>{
    try {
        const workbook = new excelJs.Workbook();
        const workSheet = workbook.addWorksheet('My Users');

        workSheet.columns = [
            {header:"S no.",key:"s_no"},
            {header:"Name",key:"name"},
            {header:"Email ID.",key:"email"},
            {header:"Mobile",key:"mobile"},
            {header:"Image",key:"image"},
            {header:"Is Admin.",key:"is_admin"},
            {header:"Is Verified",key:"is_verified"},
        ];
        let counter = 1;
        const userData = await User.find({is_admin:0});

        userData.forEach((user)=>{
            user.s_no = counter;
            workSheet.addRow(user);
            counter++;
        });

        workSheet.getRow(1).eachCell((cell)=>{
            cell.font = {bold:true};
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
        );

        res.setHeader("Content-Disposition",`attachment; filename=users.xlsx`);

        return workbook.xlsx.write(res).then(()=>{
            res.status(200);
        })
        
    } catch (error) {
        console.log(error.message);
    }
}

const exportUsersDataPdf = async (req,res)=>{
    try {
        const users = await User.find({is_admin:0});
        const data = {
            users:users
        };
        const filePathName = path.resolve(__dirname,'../views/admin/exportPdf.ejs');
        const htmlString = fs.readFileSync(filePathName).toString();
        
        let options = {
            format : "Letter"
        };
        const ejsData = ejs.render(htmlString,data);
        pdf.create(ejsData,options).toFile('users.pdf',(err,response)=>{
            if(err){console.log(err);}
            
            const filePath = path.resolve(__dirname,'../users.pdf');
            fs.readFile(filePath,(err,file)=>{
                if(err){
                    console.log(err);
                    return res.status(500).send('could not found');
                }
                res.setHeader('Content-Type','application/pdf');
                res.setHeader('Content-Disposition','attachment;filename="users.pdf"');
                res.send(file);
            })

        })
        
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    loginLoad,
    verifyLogin,
    loadAdminHome,
    logout,
    forgetLoad,
    forgetVerify,
    forgetadminpasswordLoad,
    resetPassword,
    adminDashboard,
    addUser,
    adduserPost,
    editUserLoad,
    updateUsers,
    deleteUser,
    exportUsersData,
    exportUsersDataPdf
    
}