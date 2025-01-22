const router = require("express").Router();

router.use("/user", require("./userRoutes"));

router.use("/github", require("./githubRoutes"));

module.exports = router;
