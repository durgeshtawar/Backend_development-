import mongoose, {Schema} from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
    {
       userName: {
        type:String,
        required:true,
        uniue: true,
        lowercase:true,
        trim:true,
        index:true//for searching field
       },
       email: {
        type:String,
        required:true,
        uniue: true,
        lowercase:true,
        trim:true,
       },
       fullname: {
        type:String,
        required:true,
        trim:true,
        index:true//for searching field
       },
       avtar: {
        type:String,//use cloudniary url 
        required:true,
       },
       coverImage: {
        type:String,
       },
       watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        },
       ],
       password: {
        type:String,
        required:[true, 'Password is required']
       },
       refreshToken: {
        type:String,
       
       },
       {
        timeseries:true
       },
    
}
)
userSchema.pre("save" , async function (next) {
    if(!this.isModified("password")) return next();
    
    this.password = await bcrypt.hash(this.password, 10)
    next();
})
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.genrateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        email: this.email,
        userName: this.userName,
        fullname: this.fullname
    },
    process.nextTick.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}
userSchema.methods.genrateRefreshToken = function (){
    return jwt.sign({
        _id: this._id,
       
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}
export const User = mongoose.model("User", userSchema);
