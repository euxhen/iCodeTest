const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const postSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Postimi duhet te kete permbajtje"],
      trim: true,
    },
    name: {
      type: String,
    },

    userPhoto: {
      type: ObjectId,
      ref: "User",
    },
    likes: [
      {
        type: ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        text: String,
        postedBy: { type: ObjectId, ref: "User" },
      },
    ],
    postedBy: {
      type: ObjectId,
      ref: "User",
    },
    date: {
      type: Date,
      default: Date.now(),
    },
    category: {
      type: String,
      // required: [true, "Jepni te pakten nje kategori"],
      // validate: {
      //   validator: function (el) {
      //     if (el.length < 1) return false;
      //   },
      //   message: "Jepni te pakten nje kategori",
      // },
      // enum: {
      //   values: ["node.js", "html", "js", "css", "python", "java"],
      //   message: "Zgjidhni nje prej teknologjive me siper!",
      // },
    },
  },
  {
    toJSON: { virtuals: true },
    toObjects: { virtuals: true },
  }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
