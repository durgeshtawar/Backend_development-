const express = require('express');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');


//database collection 


mongoose.connect("mongodb://localhost:27017//Auth_and_autho")
.then(()=>{
    console.log("Db connection successfull");
})
.catch((err)=>{
    console.log(err);
})



const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
    },
}, {timestamps:true});




const userModel = mongoose.model("users", userSchema);


//endpoints


//server 
const app = express();

//middleware 
app.use(express.json());


app.post("/register", (req, res)=>{
//   console.log(req.body);
  let user = req.body


 bcryptjs.genSalt(10, (err, salt)=>{
    if(!err){
        bcryptjs.hash(user.password, salt, (err, hpass)=>{
            if(!err){
               user.password = hpass;
                 

               userModel.create(user)
                .then((doc)=>{
                  res.send({message:"User registration successfull"})
               })
               .catch((err)=>{
                 console.log(err);
                 res.send({message:"Error"})
               });
            }
        })
    }
 })
 

//   res.send("Post working");
})
//login

app.post("/login", (req, res)=>{
    // console.log(req.body);

    let userCred = req.body;

    userModel.findOne({email: userCred.email})
    .then((user)=>{
            // console.log(user);
            // res.send({message:"post working"})
             

            if(user !== null){
                // res.send({message:"User found"})
                 bcryptjs.compare(userCred.password, user.password, (err, result)=>{
                    if(result === true){
                        // res.send({message:"login successfuly"})
                        //genrate token and send back 
                        jwt.sign({email:userCred.email}, "aditya", (err, token)=>{
                            if(!err){
                                req.send({token:token})
                            }
                            else{
                                res.send({message:"Some issue while creating the token pleas try again "})
                            }
                        });//jwt genrate three thing headr , pyload, secret key
                    }
                    else{
                        res.send({message:"incorrect password"});
                    }
                 })
            }else{
                res.send({message: "User with this email does not exist"});

            }
    })
    .catch((err)=>{
        console.log(err);
        res.send({message:"some problem"})
    })
})

app.get("/getdata",vereifyToken, (req, res)=>{
    res.send({message:"I am a good developer with a good heart"});

})

function vereifyToken(req, res, next)
{
    let token = req.headers.authorization.split(" ")[1];
jwt.verify(token, "aditya", (err, data)=>{
    if(!err)
    {
        console.log(data);
        next();//no error
     
    }
    else{
        res.send({message:"Invalid token pleas login again"});

    }
})
    res.send("comming from middleware");

}
app.listen(3000, ()=>{
    console.log("Server running at 3000 port");
})