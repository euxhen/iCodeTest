const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Ju lutem shkruani emrin tuaj!"],
  },
  email: {
    type: String,
    required: [true, "Ju lutem jepni email-in tuaj!"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Ju lutem jepni nje email te sakte!"],
  },
  photo: {
    type: String,
    default: "avatar.jpeg",
  },
  location: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  skills: {
    type: [String],
    default: [],
  },
  githubUsername: {
    type: String,
    default: "",
  },
  twitterProfile: {
    type: String,
    default: "",
  },
  facebookProfile: {
    type: String,
    default: "",
  },
  linkedInProfile: {
    type: String,
    default: "",
  },
  instagramProfile: {
    type: String,
    default: "",
  },
  cel: {
    type: String,
    default: "",
  },
  degree: {
    type: String,
    default: "",
  },
  website: {
    type: String,
    default: "",
  },
  experience: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    required: [true, "Ju lutem vendosni fjalekalimin tuaj!"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Ju lutem konfirmoni fjalekalimin tuaj!"],
    validate: {
      //kjo punon vetem on Create and Save
      validator: function (el) {
        return el === this.password;
      },
      message: "Fjalekalimet nuk perputhen!",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
// enkriptimi i password => salt + bcrypt
userSchema.pre("save", async function (next) {
  // perdoret pre-save middleware sepse veprimi ndodh para momentit se passwordi te ruhet ne db
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12); // parametri i dyte quhet cost(salt)

  this.passwordConfirm = undefined; // bejme undefinded passwordConfirm sepse enkriptuam vetem paswwordin
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimeStamp;
  }
  //false do te thote qe nuk eshte ndryshuar
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
