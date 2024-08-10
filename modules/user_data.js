const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name : String,
    pass : String,
    books : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'storenote'
    }]
})
let  user_data= mongoose.model('user_details',userSchema);

module.exports=user_data;