import mongoose from "mongoose";

import User from "./user.js";

const QueueSchema = new mongoose.Schema(
   {
      user_id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: User,
         required: true,
         unique: true,
      },
      attended: {
         type: Boolean,
         required: true,
         default: false,
      },
   },
   { timestamps: true }
);

const Queue = mongoose.model("Queue", QueueSchema);

export default Queue;
