import express from "express";
import {
  signup,
  login,
  forgot,
  reset,
  seedAccounts,
  firstAccount,
  updateProfile,
  updateQuickNotes,
  updateInvoice,
  dashboardData,
} from "../controllers/users.js";
import {
  userSignupValidator,
  userSigninValidator,
  userResetValidator,
} from "../validiators/auth.js";
import { runValidation } from "../validiators/index.js";

const userRouter = express.Router();

userRouter.post("/signup", userSignupValidator, runValidation, signup);
userRouter.post("/login", userSigninValidator, runValidation, login);
userRouter.post("/forgot", userResetValidator, runValidation, forgot);
userRouter.post("/reset", reset);
userRouter.post("/seed", seedAccounts);
userRouter.post("/firstAccount", firstAccount);
userRouter.get("/dashboardData/:user", dashboardData);
userRouter.put("/update", updateProfile);
userRouter.put("/quickNotes", updateQuickNotes);
userRouter.put("/updateInvoice", updateInvoice);

export default userRouter;
