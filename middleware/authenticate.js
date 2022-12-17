import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const checkUser = (req, res, next) => {
   const token = req.cookies.authentication;

   if (token) {
      jwt.verify(token, process.env.PROJECT_SECRET, async (err, decoded) => {
         if (err) {
            res.locals.user = null;
            res.redirect("/login");
            next();
         }
         let user = await User.findById(decoded.id);
         if (user) {
            res.locals.user = user;
            req.user = user;
            next();
         } else {
            res.locals.user = null;
            res.redirect("/login");
            next();
         }
      });
   } else {
      res.locals.user = null;
      res.redirect("/login");
   }
};

export const checkAdmin = (req, res, next) => {
   checkUser(req, res, () => {
      if (req.user.isAdmin) {
         next();
      } else {
         req.flash("error", "Must be an admin to have access");
         res.status(403).redirect("/dashboard");
      }
   });
};

export const preventDoubleLogin = async (req, res, next) => {
   const token = req.cookies.authentication;
   try {
      if (token) {
         await jwt.verify(
            token,
            process.env.PROJECT_SECRET,
            async (err, decoded) => {
               if (err) {
                  res.locals.user = null;
                  next();
               }
               let user = await User.findById(decoded.id);
               if (user) {
                  res.locals.user = user;
                  req.user = user;
                  res.redirect("/dashboard");
                  next();
               } else {
                  res.locals.user = null;
                  next();
               }
            }
         );
      } else {
         res.locals.user = null;
         next();
      }
   } catch (e) {}
};
