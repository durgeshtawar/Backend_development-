import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../model/user.model,js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js";
import { Jwt } from "jsonwebtoken";
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

    if(!(username || email)){
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
    const refreshAccessToken = asyncHandler(async(req, res)=>{
       const incomingRefreshTOken =  req.cookies.refreshToken ||  req.body.refreshToken

       if(!incomingRefreshTOken){
        throw new ApiError(401, "unaUthorized request ");

       }

     try {
         const decodedTOken =  jwt.verify(
           incomingRefreshTOken,
           process.env.REFRESH_TOKEN_SECRET
          )
         const user = await User.findById(decodedTOken?._id)
   
         if(!user){
           throw new ApiError = (401, "INVALID refresh error");
         }
         if(!incomingRefreshTOken != user?.refreshToken){
           throw new ApiError(401, "Refresh token is expired or used");
   
   
         }
         const options = {
           httpOnly:true,
           secure:true
         }
       const {accessToken,  newRefreshToken} =  await genrateAccessandRefreshToken(user._id)
         return res
         .status(200)
         .cookie("accessToken", accessToken, options)
         .cookies("refreshToken", refreshToken, options)
         .json(
           new ApiResponse(
               200,
               {accessToken, refreshToken: newRefreshToken },
               "Access token from refreshed"
           )
         )
         
         
     } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
        
     }
      const changeCurrentPassword = asyncHandler(async(req, res) => {
        const {oldPassword, newPassword} = req.body
        
        const user = await User.findById(req.user?._id)
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

        if(!isPasswordCorrect){
            throw new ApiError(400, "Invalid old Password")
        }
          user.password  = newPassword 
          await user.save({validateBeforeSave: false})

          return res.status(200)
          .json(new ApiResponse(200 , {}, "password change successfully"))
      })
      
    })   
    const getCurrentUser = asyncHandler(async(req, res)=>{
        return res
        .status(200)
        .json(new ApiResponse(200, res.user, "current user fetched successfully"))

    }  )      
    
    const updateAccountDetails = asyncHandler(async(req, res)=>{
        const {fullname, email} = req.body

        if(!fullname || !email){
            throw new ApiError(400, "All fields are require")
        }
       const user =  User.findByIdAndUpdate(
            req.user?._id,
            {
                $set:{
                    fullname,
                    email,

                }
            },
            {new : true}
            )
            .select("-password")
            return res.status(200)
            .json(new ApiResponse(200, user, "Account details updated successfully"))

    })

    const updateUserAvtar = asyncHandler(async (req, res)=>{
             const avatarLocalPath = req.file?.path

             if(!avatarLocalPath){
                throw new ApiError(400, "Avatar File is missing")
             }
             const avtar = await uploadOnCloudinary
             (avatarLocalPath)
             if(!avtar.url){
                throw new ApiError(400, "Error while uploading on avtar")
             }
             await User.findByIdAndUpdate(
                req.user?._id,
                {
                    $set:{
                        avtar: avtar.url
                    }
                },
                {new:true}
             ).select("-password")
    })
    const getUserChanleProfile = asyncHandler(async(req, res)=>{
       const {username} =    req.params

       if(!username?.trim()){
        throw new ApiError(400, "User name is missing")
       }

       const chanle = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),

            }
        },
        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "chanle",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "Subscriber",
                as: "subscribed2"//chanle  subscribe you

            }
        },
        {
            $addField: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscribeToCount: {
                    $size: "$subscribed2"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscriberCount: 1,
                channelSubscribeToCount: 1,
                isSubscribed: 1,
                avtar: 1,
                coverImage: 1,
                email: 1,
            }
        }
       ])
       if(!chanle?.length){
        throw new ApiError(404 , "Chanle does not exists")
       }
       return res.status(200)
       .json(
        new ApiResponse(200, chanle[0], "User channel fetched successfully")
        
       )
    })
   export {
       registerUser,
       loginUser,
       logoutUser,
       refreshAccessToken,
       changeCurrentPassword,
       getCurrentUser,
       updateAccountDetails,
       updateUserAvtar,
       getUserChanleProfile,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    

};