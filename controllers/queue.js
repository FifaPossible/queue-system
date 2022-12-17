import twilio from "twilio";

import { DESdecrypt } from "../encryption.js";
import Queue from "../models/queue.js";
import User from "../models/user.js";

export const createQueue = async (req, res) => {
   const user_id = req.body.userId;
   try {
      const inQueue = await Queue.findOne({ user_id });
      if (!inQueue) {
         await Queue.create({ user_id });
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
      await Queue.findOneAndDelete({ user_id: req.body.id });
      req.flash("deleted", "Queue deleted successfully!!");
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
      const attended = await Queue.findOne({ user_id: req.body.id });
      if (attended.attended === false) {
         await Queue.findOneAndUpdate(
            { user_id: req.body.id },
            { attended: true }
         );
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
      let userIds = [];
      const queue = await Queue.find();
      queue
         .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
         .filter((d) => !d.attended)
         .map((d, k) => userIds.push(d.user_id));
      const records = await User.find({ _id: { $in: userIds } });
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
