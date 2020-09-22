const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const authController = require("../controllers/authController");
// router.param("id", postController.checkID);
router.post("/postJob", postController.postJob);
router.get("/jobs", postController.getAllJobPosts);
router.get("/forum", postController.getAllJobsAndPosts);
router.get("/jobs/:id", postController.getJob);
router.get("/searchPost", postController.getSearchedPosts);
router
  .route("/")
  .get(postController.getAllPosts)
  .post(authController.protect, postController.createPost);
router
  .route("/:id")
  .get(postController.getPost)
  .patch(authController.protect, postController.updatePost)
  .delete(authController.protect, postController.deletePost);

router.put("/like/:id", authController.protect, postController.likePost);
router.put("/unlike/:id", authController.protect, postController.unlikePost);
router.put("/comment/:id", authController.protect, postController.postComment);
router.put(
  "/deleteComment/:id/:comment_id",
  authController.protect,
  postController.deleteComment
);

module.exports = router;
