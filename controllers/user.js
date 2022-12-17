import jwt from "jsonwebtoken";
import User from "../models/user.js";

const maxAge = 3 * 60 * 60 * 24;

const tokenGenerator = (id) => {
   return jwt.sign({ id }, process.env.PROJECT_SECRET, { expiresIn: maxAge });
};

export const loginPage = (req, res) => {
   const error = req.flash("error");
   res.render("login", { error });
};

export const signupPage = (req, res) => {
   const error = req.flash("error");
   res.render("signup", { error });
};

export const dashboard = async (req, res) => {
   const error = req.flash("error");
   const joined = req.flash("joined");
   const user = res.locals.user;
   res.render("dashboard", { error, user, joined });
};

export const homepage = async (req, res) => {
   res.render("home");
};

export const handleSignup = async (req, res) => {
   const email = req.body.email;
   try {
      const userFind = await User.findOne({ email });
      if (!userFind) {
         const user = await User.create(req.body);
         if (user) {
            const token = tokenGenerator(user._id);
            res.cookie("authentication", token, {
               httpOnly: true,
               maxAge: 1000 * maxAge,
            });
            res.redirect("/dashboard");
         }
      } else {
         req.flash("error", "user already exist");
         res.redirect("/signup");
      }
   } catch (err) {
      req.flash("error", err.message);
      res.redirect("/signup");
   }
};

export const handleLogin = async (req, res) => {
   try {
      const userx = await User.compareDetails(
         req.body.email,
         req.body.password
      );
      if (userx) {
         const token = tokenGenerator(userx._id);
         res.cookie("authentication", token, {
            httpOnly: true,
            maxAge: 1000 * maxAge,
         });
         res.locals.user = userx;
         res.redirect("/dashboard");
      }
   } catch (err) {
      req.flash("error", err.message);
      res.redirect("/login");
   }
};

export const logout = (req, res) => {
   res.cookie("authentication", "", { maxAge: 1 });
   res.locals.user = null;
   req.user = null;
   res.redirect("/login");
};
