const express = require('express');
const adminRoute = express();
const Person = require('../models/personModel');
const Address = require('../models/addressModel')

adminRoute.post('/api/staff', async (req, res) => {
   try {
      const {name,email} = req.body;
      const staff = await Address.create({
         name,
         email
      })
      return res.send(staff);
   } catch (error) {
      console.log(error);
   }
});
adminRoute.post('/api/person',async (req,res)=>{
   const right = await Person.create({
      staff_id:req.body.staff_id,
      right:req.body.right
   })
   const rightData = await right.save();
   return res.send(rightData); 
})
module.exports = adminRoute;