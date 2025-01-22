// const { Octokit, App } = require("octokit");

// const axios = require("axios");

const webhookHandler = async (req, res) => {
  try {
    console.log("Webhook called");

    // Parse GitHub webhook payload
    const { action, pull_request, repository } = req.body;

    console.log(req.body);

    // if (action === "opened" || action === "synchronize") {
    //   console.log("Processing PR...");

    //   const owner = repository.owner.login;
    //   const repo = repository.name;
    //   const pullNumber = pull_request.number;

    //   // Step 1: Fetch PR Files
    //   const files = await fetchPRFiles(owner, repo, pullNumber, pull_request.head.sha);

    //   // Step 2: Analyze Files with OpenAI
    //   const comments = await analyzeWithOpenAI(files);

    //   // Step 3: Post Comments on GitHub PR
    //   await postCommentsOnPR(owner, repo, pullNumber, comments);
    // }

    res.status(200).send("Webhook processed");
  } catch (error) {
    console.error("Error in webhookHandler:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  webhookHandler,
};
