const express = require('express');
const app=express();
const bodyparser=require('body-parser');
const path=require('path');
const exhbs=require('express-handlebars');
const mongoose=require('mongoose');
const user = require('./modules/user_data');
const book = require('./modules/book_data');
let connection =false;

app.engine('hbs',exhbs.engine({
        extname:'hbs',
        defaultLayout: false,
        layoutsDir : path.join(__dirname,'views'),
        runtimeOptions:{
               allowProtoPropertiesByDefault:true,
               allowProtoMethodsByDefault:true
        }
}));
app.set('view engine','hbs');
app.set('views',path.join(__dirname,'views'));

mongoose.connect('mongodb+srv://sakthikumarask777:a1%40sakthi@notebook.9s0mjym.mongodb.net/?retryWrites=true&w=majority&appName=notebook')
.then(()=>{
        connection=true;
        console.log("connected");
}).catch((err)=>{
console.log("error");
connection=false;
});



app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());
app.use('/static',express.static(path.join(__dirname,'static')));

app.get('/',async(req,res)=>{

        if(req.query.status == 1){
                res.sendFile(path.join(__dirname,'views','register.html'));
        }
        else{
        res.render('loginpage',{});
        }
})

app.post('/',async(req,res)=>{


        if(req.query.status == 1){
                let name = req.body.name;
                let pass = req.body.pass;

                const user_data =new user({
                        name : name,
                        pass : pass,
                        books :[]
                });
                await user_data.save();
                return res.redirect('/?status=0');
        }
        else{
        let db_name= await user.findOne({name:req.body.name , pass:req.body.pass});
                if(!db_name ){
                        let message ="user not found";
                        res.render('loginpage',{message});
                }
                else{
                        return res.redirect(`/user/${db_name._id}`);
                }
                
        };
});

app.get('/user/:user_id',async (req,res)=>{
        const user_id = req.params.user_id;

        if(!connection){
                return  res.status(404).sendFile(path.join(__dirname,'/views/datanotfound.html'));
          }
          
          let data = await user.findOne({_id:user_id}).populate('books');
          let booksdata=data.books;
          res.render('main',{booksdata,user_id});
        });

app.post('/user/:user_id',async(req,res)=>{
        if(req.body.title!='' && req.body.author!='' && req.body.description!=''){
                let Title=req.body.title;
                let Author=req.body.author;
                let Description=req.body.description;
        book_detail=new book({
                title: Title,
                author:Author,
                description:Description
        })
        let user_id=req.params.user_id;
        await book_detail.save();
        const create_book=await user.findOne({_id:user_id});
        await create_book.books.push(book_detail._id);
        await create_book.save();
        return res.redirect(`/user/${user_id}`);
        }
});

app.get('/user/delete_book/:user_id',async(req,res)=>{
        let delete_id = req.query.delete_book;
        let user_id=req.params.user_id;
        await book.deleteOne({_id:delete_id});
        // delete_book=await user.findOne({ _id:user_id}).populate({
        //         path:'books',
        //         match:{_id:delete_id}
        // })
        // delete_book.books
        await user.updateOne({_id:user_id},{$pull:{books:delete_id}})
        res.redirect(`/user/${user_id}`);
})

app.get('/user/edit_book/:user_id',async(req,res)=>{
        let edit_id= req.query.edit_id;
        let user_id=req.params.user_id;
        let bookdetails = await user.findOne({_id:user_id}).populate({
                path:'books',
                match :{_id:edit_id}
});
        let book_details=bookdetails.books[0];
        return res.render('updatePage',{book_details ,user_id});
});

app.post('/user/update_book/:user_id',async(req,res)=>{
        let update_id= req.query.update_id;
        let user_id=req.params.user_id;
        await book.findByIdAndUpdate(update_id,{title:req.body.title,author:req.body.author,description:req.body.description});
        res.redirect(`/user/${user_id}`);
})

  app.use((req,res)=>{
         res.sendFile(path.join(__dirname,'/views/404.html'));
 })

app.listen(8000);
