const mongoose=require('mongoose');

const note= new mongoose.Schema({

    title: String,
    author: String,
    description: String,
})
const store_note=mongoose.model('storenote',note);


module.exports = store_note;