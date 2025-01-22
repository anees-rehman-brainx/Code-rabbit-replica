// const { Octokit, App } = require("octokit");

const { GITHUB_ACTIONS } = require("../constants");

const axios = require("axios");

const webhookHandler = async (req, res) => {
  try {
    // Parse GitHub webhook payload
    const { action, pull_request, repository } = req.body;

    if (
      action === GITHUB_ACTIONS.OPENED ||
      action === GITHUB_ACTIONS.SYNCHRONIZE
    ) {
      const owner = repository.owner.login;
      const repo = repository.name;
      const pullNumber = pull_request.number;

      console.log(
        "owner: " + owner + "  repo: " + repo + "   pullNumber: " + pullNumber
      );

      // Step 1: Fetch PR Files
      const files = await fetchPRFiles(
        owner,
        repo,
        pullNumber,
        pull_request.head.sha
      );

      console.log("files", files);

      // Step 2: Analyze Files with OpenAI
      //   const comments = await analyzeWithOpenAI(files);

      // Step 3: Post Comments on GitHub PR
      //   await postCommentsOnPR(owner, repo, pullNumber, comments);
    }

    res.status(200).send("Webhook processed");
  } catch (error) {
    console.error("Error in webhookHandler:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const fetchPRFiles = async (owner, repo, pullNumber, sha) => {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
    },
  });

  return response.data.map((file) => ({
    filename: file.filename,
    content: file.patch, // Diff content
  }));
};

module.exports = {
  webhookHandler,
};
