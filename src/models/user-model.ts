import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  codes: [
    {
      value: { type: String, required: true },
      status: { type: Boolean, required: true },
    },
  ],
});

export const User = mongoose.model("User", userSchema);