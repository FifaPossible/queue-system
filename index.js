import express from "express";
import mongoose from "mongoose";
import flash from "connect-flash";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import session from "express-session";

import router from "./router.js";
import User from "./models/user.js";

const app = express();
dotenv.config();
mongoose.connect(
   process.env.DB_CONNECTION_STRING,
   { useNewUrlParser: true, useUnifiedTopology: true },
   async () => {
      try {
         const user = await User.findOne({ isAdmin: true });
         if (!user) {
            await User.create({
               first_name: process.env.ADMIN_FIRSTNAME,
               last_name: process.env.ADMIN_LASTNAME,
               email: process.env.ADMIN_EMAIL,
               password: process.env.ADMIN_PASSWORD,
               phone_number: process.env.ADMIN_PHONENUMBER,
               nin: process.env.ADMIN_NIN,
               bvn: process.env.ADMIN_BVN,
               isAdmin: true,
            });
         }
         console.log("connected to database");
      } catch (e) {}
   }
);

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(
   session({
      secret: process.env.SECRET_GEN,
      cookie: { maxAge: 6000 },
      resave: false,
      saveUninitialized: false,
   })
);
app.use(flash());

app.use(router);

app.listen(process.env.PORT, () =>
   console.log(`app started in port ${process.env.PORT}`)
);
