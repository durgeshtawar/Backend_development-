import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../model/user.model,js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js";

const genrateAccessTokenAndRefreshTokens = async(userid)=>{
    try{
      const user =  await User.findById(userid)
     const accessToken =  user.genrateAccessToken()
      const refreshToken = user.genrateRefreshToken()

      user.refreshToken = refreshToken
     await user.save({validateBeforeSave: false})
      
     return {accessToken, refreshToken}
     


    } catch(error){
       throw new ApiError(500, "Something went wrong while genrating refresh and access token")
    }
}

const registerUser = asyncHandler (async (req, res) => {
    //get user details from frontend 
    //validation  - not empty 
    //check if user already exists : username, email
    //check for image , check for avtar
    //upload them to  cloudinary , avtar
    //create user object - create entry in db 
    //remove password and refresh token field from response 
    //check for user creation 
    // return response 

   const {fullname, email, username, password} = req.body 
   console.log("email", email);

// if(fullname === ""){
//    throw new ApiError(400, "fullname is required")
// }
if(
    [fullname, email, username, password].some((field)=>
     field ?.trim() === " "
    )
){
   throw new ApiError(400, "All field are rquired")
}
 const existedUser = await User.findone({
    $or: [{username},{email}]
})
if(existedUser){
    throw new ApiError(409, "User with emai or username already exists")
}
const avtarLocalPath = req.files?.avtar[0]?.path
// const coverImageLocalPath = req.files?.coverImage[0]?.path;

let coverImageLocalPath;
if(req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length > 0 ){
    coverImageLocalPath = req.files.coverImage[0].path;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
}
if(!avtarLocalPath){
    throw new ApiError(400, "Avtar file is required")
}
     const avtar = await uploadOnCloudinary(avtarLocalPath)  
     const coverImage = await uploadOnCloudinary(coverImageLocalPath)

     if(!avtar){
        throw new ApiError(400, "Avtar file is required")
     }
   const user = await  User.create({
        fullname,
        avtar: avtar.url,
        coverImage: coverImage?.urlf || "",
        email,
        password,
        username: username.toLowerCase()

     })
    const createdUser =   await User.findById(user._id).select(
        "-passowrd -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500, "Somthing went wrong while registering the user");

    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")
        
    )
})

const loginUser = asyncHandler(async (req, res)=>{
    //req body data 
    //username or email 
    //find the user 
    //password check 
    //access and refresh token 
    //send cookie
    const {email, username, password} = req.body

    if(!username || !email){
        throw new ApiError(400, "username or password is required")
    }
         const user = await User.findOne({
            $or: [{username}, {email}]
           })
           if(!user){
            throw new ApiError(404, "user does not exist")
           }

           const isPasswordValid = await user.isPasswordCorrect(password)

            if(!isPasswordValid){
            throw new ApiError(401,"Invalid user credentials")
         }
         const {accessToken, refreshToken} = await
          genrateAccessTokenAndRefreshTokens(user._id)

       const loggedInUser =  await user.findById(user._id)
       select("-password -refreshToken")

       const options = {
        httpOnly: true,
        secure: true
       }
       return res.
       status(200).cookie("accessToken" , accessToken, options).cookie("refreshToken", refreshToken, options)
       .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken,
                refreshToken
            },
            "User Logged In Succesfully"
        )
       )
     })    
     const logoutUser = asyncHandler(async(req, res)=>{
      await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
            {
                new: true
            }
        
       )
       const options = {
        httpOnly: true,
        secure:true
       }
       return res
       .status(200)
       .clearCookie("refreshToken", options)
       .clearCookie("accessToken", options)
       .json(new ApiResponse(200, {}, "User Logged Out"))
       
    })                                                                    
   export {
       registerUser,
       loginUser,
       logoutUser
};