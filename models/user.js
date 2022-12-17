import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { DESencrypt } from "../encryption.js";

const UserSchema = new mongoose.Schema(
   {
      first_name: {
         type: String,
         required: true,
         trim: true,
      },
      last_name: {
         type: String,
         required: true,
         trim: true,
      },
      other_name: {
         type: String,
         trim: true,
      },
      phone_number: {
         type: Number,
         required: true,
         unique: true,
      },
      bvn: {
         type: String,
         required: true,
         trim: true,
         unique: true,
      },
      nin: {
         type: String,
         required: true,
         trim: true,
         unique: true,
      },
      password: {
         type: String,
         required: true,
         minLength: 6,
         trim: true,
      },
      email: {
         type: String,
         required: true,
         unique: true,
         trim: true,
      },
      isAdmin: {
         type: Boolean,
         required: true,
         default: false,
      },
   },
   { timestamps: true }
);

UserSchema.pre("save", async function (next) {
   const salt = await bcrypt.genSalt();
   this.password = await bcrypt.hash(this.password, salt);
   this.nin = DESencrypt(this.nin);
   this.bvn = DESencrypt(this.bvn);
   next();
});

UserSchema.statics.compareDetails = async function (email, password) {
   const user = await this.findOne({ email });
   if (user) {
      const checkPass = await bcrypt.compare(password, user.password);
      if (checkPass) {
         return user;
      } else {
         throw Error("invalid password");
      }
   }
   throw Error("invalid email");
};

const User = mongoose.model("User", UserSchema);

export default User;
