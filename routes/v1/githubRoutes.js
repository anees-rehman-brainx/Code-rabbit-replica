const router = require("express").Router();
const { githubController } = require("../../controllers");

router.post("/webhook_handler", githubController.webhookHandler);

module.exports = router;
