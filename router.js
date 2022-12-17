import express from "express";
import {
   createQueue,
   deleteQueue,
   getQueue,
   queueSingle,
   updateQueue,
} from "./controllers/queue.js";
import {
   dashboard,
   handleLogin,
   handleSignup,
   homepage,
   loginPage,
   logout,
   signupPage,
} from "./controllers/user.js";
import {
   checkAdmin,
   checkUser,
   preventDoubleLogin,
} from "./middleware/authenticate.js";

const router = express.Router();

router.get("/", homepage);

router.route("/login").get(preventDoubleLogin, loginPage).post(handleLogin);
router.route("/signup").get(preventDoubleLogin, signupPage).post(handleSignup);
router.get("/dashboard", checkUser, dashboard);

router.route("/queue").get(checkAdmin, getQueue).post(createQueue);
router.post("/deleteQueue", deleteQueue);
router.post("/attendQueue", updateQueue);

router.get("/queue/:id", checkAdmin, queueSingle);

router.get("/logout", logout);

export default router;
