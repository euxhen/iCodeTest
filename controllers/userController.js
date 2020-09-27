const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const multer = require("multer");
const sharp = require("sharp");
const cloudinary = require("cloudinary");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Ju lutem ngarkoni nje imazh.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(
      `https://api.cloudinary.com/v1_1/devztowmv/image/upload/${req.file.filename}`
    );

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).send({
    status: "success",
    results: users.length,
    data: {
      users: users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("Nuk u gjend asnje user me kete ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "Ky route nuk eshte per te ndryshuar fjalekalimin. Ju lutem perdorini /updateMyPassword.",
        400
      )
    );
  }
  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    "bio",
    "name",
    "email",
    "degree",
    "location",
    "skills",
    "githubUsername",
    "twitterProfile",
    "facebookProfile",
    "linkedInProfile",
    "instagramProfile",
    "cel",
    "website",
    "experience"
  );
  if (req.file) filteredBody.photo = req.file.filename;
  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});
