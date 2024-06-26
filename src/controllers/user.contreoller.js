import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {user} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registeruser= asyncHandler(async(req,res)=>{
    
    const {fullName,email,username,password}=req.body
    console.log("email",email);

    if(
        [fullName,email,username,password].some((field)=>
        field?.trim()==="")
    ){
        throw new ApiError(400,"all fields are required")
    }

    //checking th euser is existed or not with username and email
    const existedUser=user.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"user with email or username already exists")
    }


    //multer
    const avaterLocalPath = req.files?.avater[0]?.path
    const coverImageLocatPath = req.files?.coverImage[0]?.path
    if(!avaterLocalPath){
        throw new ApiError(400,"Avtar file is required")
    }

    //upload on cloudionary
    const avatar=await uploadOnCloudinary(avaterLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocatPath)

    if(!avatar){
        throw new ApiError(400,"Avtar file is required")
    }

    //database entry
   const user=await user.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    const createdUser = await UserActivation.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while regestring the user")
    }


    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered succesfully")
    )


})

export{registeruser}