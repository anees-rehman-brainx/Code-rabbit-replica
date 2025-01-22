const { GITHUB_ACTIONS } = require("../constants");

const axios = require("axios");
const { openAIService } = require("../services");

(async () => {
  const { Octokit, App } = await import("octokit");

  const octokit = new Octokit({
    auth: process.env.GITHUB_ACCESS_TOKEN, // Your GitHub token
  });

  // Use `octokit` as usual
})();

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
      if (comments && comments?.length) {
        comments.map(async (comment) => {
          await postCommentOnPR(owner, repo, pullNumber, comment);
        });
      }
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

const postCommentOnPR = async (
  repoOwner,
  repoName,
  pullRequestNumber,
  comment
) => {
  try {
    const response = await octokit.rest.pulls.createReviewComment({
      owner: repoOwner,
      repo: repoName,
      pull_number: pullRequestNumber,
      body: comment.body,
      path: comment.path,
      position: comment.position, // Ensure this corresponds to a valid diff position
    });
    console.log("Comment posted successfully:", response.data);
  } catch (error) {
    console.error("Error posting comment:", error.response.data);
  }
};
module.exports = {
  webhookHandler,
};
