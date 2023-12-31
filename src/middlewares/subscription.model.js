import mongoose , {Schema, model} from "mongoose";

const subscriptionSchema = new Schema({
     subscriber:{
        type:Schema.Types.ObjectId,//one who is subscribing 
        
        ref:"User"
     },
     channle:{
        type:Schema.Types.ObjectId,//one who is subscribing for subscriber

        ref:"User"
     }
}, {timestamps: true})

export const Subscription = mongoose.model("Subscription" , subscriptionSchema);
