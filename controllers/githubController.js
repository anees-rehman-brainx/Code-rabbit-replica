// const { Octokit, App } = require("octokit");

const { GITHUB_ACTIONS } = require("../constants");

const axios = require("axios");
const { openAIService } = require("../services");

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

      // Step 2: Analyze Files with OpenAI
      const comments = await openAIService.analyzeCodeWithOpenAI(files);

      console.log("comments", comments);

      // Step 3: Post Comments on GitHub PR
      await postCommentsOnPR(owner, repo, pullNumber, comments);
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

const postCommentsOnPR = async (owner, repo, pullNumber, comments) => {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/comments`;

  for (const comment of comments) {
    await axios.post(
      url,
      {
        path: comment.path,
        position: comment.position,
        body: comment.body,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
        },
      }
    );
  }
};

module.exports = {
  webhookHandler,
};
