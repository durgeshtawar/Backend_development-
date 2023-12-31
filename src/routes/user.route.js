import { Router } from "express";
import { 
    loginUser, logoutUser, registerUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvtar, getUserChanleProfile, getWatchHistory 
} 
from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"


const router = Router()

router.route("/register").post(
    upload.fields([
        {
            nmae: "avtar",
            maxCount : 1
        },
        {
            nmae: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )
router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT,  logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"),
updateUserAvtar
)
router.route("/cover-image").patch(verifyJWT, upload.single(
    "/coverImage"
), updateUserCoverImage)
router.route("/c/:username").get(verifyJWT, getUserChanleProfile)
router.route("/history").get(verifyJWT, getWatchHistory)

export default router;
