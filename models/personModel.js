const mongoose = require('mongoose');


const personSchema = new mongoose.Schema({
    
    staff_id: { type: mongoose.Schema.Types.ObjectId, ref: 'staff' },
    right:{
        type:String
    }
});
module.exports = mongoose.model('Person', personSchema);

