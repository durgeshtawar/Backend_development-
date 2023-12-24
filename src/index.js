// require('dotenv').config({path: './env'});
import dotenv from "dotenv"
import mongoose  from "mongoose";
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})

connectDB();




//first approach ----> 1
// const app = express();

// (async ()=> {
//     try{
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//     app.on("error", (error)=>{
//         console.log("ERROR:", error);
//         throw error
//     })

//     app.listen(proce.env.PORT, ()=>{
//         console.log(`App is listining on port ${process.env.PORT}`);
//     })
//     }catch(error){
//         console.error("ERROR", error);
//         throw error
//     }
// })()