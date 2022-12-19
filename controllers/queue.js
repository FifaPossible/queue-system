import moment from "moment/moment.js";
import twilio from "twilio";

import { DESdecrypt } from "../encryption.js";
import User from "../models/user.js";

export const createQueue = async (req, res) => {
   const user_id = req.body.userId;
   const joined_queue = new Date();
   const sendAt = moment(joined_queue).add(16, "m").toDate();

   let client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
   );

   try {
      const user = await User.findOne({ _id: user_id });
      if (user.in_queue === false) {
         await User.findOneAndUpdate(
            { _id: user_id },
            { in_queue: true, joined_queue }
         );
         const mess = await client.messages.create({
            messagingServiceSid: process.env.MESSAGE_SERVICE_SID,
            body: `dear ${user.first_name.toUpperCase()} ${user.last_name.toUpperCase()} we are currently attending to you right now.`,
            sendAt,
            scheduleType: "fixed",
            from: `${process.env.TWILIO_PHONE_NUMBER}`,
            to: `+234${user.phone_number}`,
         });
         req.flash("joined", "Joined queue successfully");
         res.redirect("/dashboard");
      } else {
         req.flash("error", "You are already in queue");
         res.redirect("/dashboard");
      }
   } catch (e) {
      req.flash("error", e.message);
      res.redirect("/dashboard");
   }
};

export const deleteQueue = async (req, res) => {
   try {
      const user = await User.findOneAndUpdate(
         { _id: req.body.id },
         { in_queue: false }
      );
      req.flash(
         "deleted",
         `${user.first_name} ${user.last_name} removed from queue successfully!!`
      );
      res.redirect("/queue");
   } catch (e) {
      req.flash("error", e.message);
      res.redirect(`/queue/${req.body.id}`);
   }
};

export const updateQueue = async (req, res) => {
   let client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
   );
   try {
      const attended = await User.findOne({ _id: req.body.id });
      if (attended.in_queue === true) {
         await User.findOneAndUpdate({ _id: req.body.id }, { in_queue: false });
         await client.messages.create({
            body: `dear ${req.body.first_name.toUpperCase()} ${req.body.last_name.toUpperCase()} you have been attended to in our banking system`,
            from: `${process.env.TWILIO_PHONE_NUMBER}`,
            to: `+234${req.body.phone_number}`,
         });
         req.flash(
            "attended",
            `Attended to ${req.body.first_name.toUpperCase()} ${req.body.last_name.toUpperCase()} successfully!!`
         );
         res.redirect(`/queue`);
      } else {
         req.flash("error", "User have already been attended to!");
         res.redirect(`/queue/${req.body.id}`);
      }
   } catch (e) {
      req.flash("error", e.message);
      res.redirect(`/queue/${req.body.id}`);
   }
};

export const getQueue = async (req, res) => {
   try {
      const queue = await User.find();
      const records = queue
         .sort(
            (b, a) =>
               new Date(a.joined_queue).getTime() -
               new Date(b.joined_queue).getTime()
         )
         .filter((d) => d.in_queue);
      const attended = req.flash("attended");
      const deleted = req.flash("deleted");
      res.render("queues", { records, attended, deleted });
   } catch (e) {}
};

export const queueSingle = async (req, res) => {
   const id = req.params.id;
   const record = await User.findOne({ _id: id });
   record.bvn = DESdecrypt(record.bvn);
   record.nin = DESdecrypt(record.nin);
   const error = req.flash("error");
   res.render("queueSingle", { record, error });
};
