import express from "express";

import {
  registerController,
  loginController,
  testController,
  forgotPasswordController,
  updateProfileController,
  getUserProfileController, 
} from "../controllers/authController.js";
import { requireSignIn, isAdmin } from "../Middlewares/authMiddlewares.js";
//router object
const router = express.Router();

//get all user


//routing
//REGISTER || METHOD POST
router.post("/register", registerController);


//LOGIN 
router.post("/login", loginController);

router.get("/profile", requireSignIn, getUserProfileController);

//forget passworrd || post
router.post("/ForgetPassword", forgotPasswordController);
//test routes
router.get("/test", requireSignIn, isAdmin, testController);

//protected route auth
//user
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});
//adminn
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

//update profile
router.put("/profile", requireSignIn,updateProfileController);




export default router;