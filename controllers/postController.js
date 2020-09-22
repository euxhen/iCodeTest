const Post = require("../models/postModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Job = require("../models/jobModel");

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ["page", "category"];
  excludedFields.forEach((el) => delete queryObj[el]);
  const posts = await Post.find()
    .populate("comments.postedBy", "name")
    .skip((req.query.page - 1) * 16)
    .limit(16);

  res.status(200).send({
    status: "success",
    results: posts.length,
    data: {
      posts: posts,
    },
  });
});
exports.getSearchedPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find({ category: req.query.category })
    .populate("postedBy", ["photo", "name"])
    .populate("comments.postedBy", ["photo", "name"])
    .sort("-date")
    .skip((req.query.page - 1) * 10)
    .limit(10);

  res.status(200).send({
    status: "success",
    data: {
      posts: posts,
    },
  });
});
exports.getJob = catchAsync(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(new AppError("Nuk u gjend asnje post me kete ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      jobs: job,
    },
  });
});
exports.getAllJobPosts = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ["page"];
  excludedFields.forEach((el) => delete queryObj[el]);
  const jobs = await Job.find()
    .skip((req.query.page - 1) * 10)
    .limit(10);
  res.status(200).send({
    status: "success",
    results: jobs.length,
    data: {
      jobs: jobs,
    },
  });
});
exports.getAllJobsAndPosts = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ["page"];
  excludedFields.forEach((el) => delete queryObj[el]);
  const jobs = await Job.find()
    .sort("-createdAt")
    .skip((req.query.page - 1) * 10)
    .limit(10);

  const posts = await Post.find()
    .populate("userPhoto", "photo")
    .populate("postedBy", ["photo", "name"])
    .populate("comments.postedBy", ["photo", "name"])

    .sort("-date")
    .skip((req.query.page - 1) * 10)
    .limit(10);

  res.status(200).send({
    status: "success",
    results: posts.length,
    data: {
      posts: posts,
      jobs: jobs,
    },
  });
});
exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError("Nuk u gjend asnje post me kete ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      posts: post,
    },
  });
});
exports.createPost = catchAsync(async (req, res, next) => {
  if (!req.user.id) {
    return next(new AppError("Ju lutem hyni qe te postoni!", 403));
  }
  const newPost = await Post.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      post: newPost,
    },
  });
});
exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (post.postedBy.toString() !== req.user.id.toString()) {
    return next(new AppError("Perdorues i pa autorizuar", 403));
  }

  if (!post) {
    return next(new AppError("Nuk u gjend asnje post me kete ID", 404));
  }
  post.text = req.body.text;
  await post.save();
  res.status(200).json({
    status: "success",
    data: {
      post: post,
    },
  });
});
exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (post.postedBy.toString() !== req.user.id.toString()) {
    return next(new AppError("Perdorues i pa autorizuar", 403));
  }

  if (!post) {
    return next(new AppError("Nuk u gjend asnje post me kete ID", 404));
  }

  await post.deleteOne();

  res.status(204).json({
    status: "success",
    data: "deleted",
  });
});

exports.likePost = catchAsync(async (req, res, next) => {
  const likedPost = await Post.findByIdAndUpdate(req.params.id);

  if (likedPost.likes.includes(req.user.id)) {
    return next(new AppError("Ky postim eshte bere like", 403));
  }
  likedPost.likes.push(req.user._id);
  await likedPost.save();
  res.status(201).json({
    status: "success",
    data: likedPost,
  });
});
exports.unlikePost = catchAsync(async (req, res, next) => {
  const likedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $pull: { likes: req.user._id },
    },
    {
      new: true,
    }
  );
  await likedPost.save();
  res.status(200).json({
    status: "success",
    data: likedPost,
  });
});

exports.postComment = catchAsync(async (req, res, next) => {
  const newComment = {
    text: req.body.text,
    postedBy: req.user._id,
  };

  const post = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        comments: newComment,
      },
    },
    { new: true }
  ).populate("comments.postedBy", "name");
  if (!post) {
    return next(new AppError("Nuk u gjend asnje post me kete ID", 404));
  }

  await post.save();

  res.status(200).json({
    status: "success",
    data: post,
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  const comment = post.comments.find(
    (comment) => comment.id === req.params.comment_id
  );

  if (comment.postedBy.toString() !== req.user.id.toString()) {
    return next(new AppError("Perdorues i pa autorizuar", 403));
  }
  if (!post) {
    return next(new AppError("Nuk u gjend asnje post me kete ID", 404));
  }
  if (!comment) {
    return next(new AppError("Nuk u gjend asnje koment me kete ID", 404));
  }

  post.comments.pull(comment);

  await post.save();

  res.status(200).json({
    status: "success",
    data: post,
  });
});

exports.postJob = catchAsync(async (req, res, next) => {
  const newJob = await Job.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      post: newJob,
    },
  });
});
