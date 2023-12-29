import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
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


export default router;
