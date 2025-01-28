const { GITHUB_ACTIONS } = require("../constants");
const axios = require("axios");
const { openAIService } = require("../services");
const getOctokit = require("../config/octokit");

const webhookHandler = async (req, res) => {
  try {
    const { action, pull_request, repository, after } = req.body;

    if (
      action === GITHUB_ACTIONS.OPENED ||
      action === GITHUB_ACTIONS.SYNCHRONIZE
    ) {
      const owner = repository.owner.login;
      const repo = repository.name;
      const pullNumber = pull_request.number;
      const commitId = after;

      console.log(
        `owner: ${owner}, repo: ${repo}, pullNumber: ${pullNumber}, commit: ${commitId}`
      );

      // Step 1: Fetch PR or Commit Files
      const files = await fetchPRFiles(owner, repo, pullNumber, commitId);

      console.log("Fetched:", JSON.stringify(files));

      // Step 2: Analyze Files with OpenAI
      const comments = await openAIService.analyzeCodeWithOpenAI(files);

      console.log("Comments generated:", comments);

      // Step 3: Post Comments on GitHub PR
      if (comments && comments.length) {
        for (const comment of comments) {
          await postCommentOnPR(owner, repo, pullNumber, comment, commitId);
        }
      }
    }

    res.status(200).send("Webhook processed successfully");
  } catch (error) {
    console.error("Error in webhookHandler:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const fetchPRFiles = async (owner, repo, pullNumber, commitId) => {
  try {
    const url = commitId
      ? `https://api.github.com/repos/${owner}/${repo}/commits/${commitId}`
      : `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
      },
    });

    // Use parseDiff to process patches
    const files = commitId
      ? response.data.files.map((file) => ({
          filename: file.filename,
          content: file.patch || "",
          changes: parseDiff(file.patch || ""), // Parse changes for commits
        }))
      : response.data.map((file) => ({
          filename: file.filename,
          content: file.patch || "",
          changes: parseDiff(file.patch || ""), // Parse changes for PR files
        }));

    return files;
  } catch (error) {
    console.error("Error fetching PR or commit files:", error.message);
    throw error;
  }
};

const parseDiff = (patch) => {
  const changes = [];
  const lines = patch.split("\n");
  let currentLine = null;

  lines.forEach((line) => {
    if (line.startsWith("@@")) {
      const match = line.match(/\+(\d+)(,\d+)?/);
      if (match) {
        currentLine = parseInt(match[1], 10);
      }
    } else if (line.startsWith("+") && !line.startsWith("+++")) {
      if (currentLine !== null) {
        changes.push(currentLine);
        currentLine++;
      }
    }
  });

  return changes;
};

const postCommentOnPR = async (
  repoOwner,
  repoName,
  pullRequestNumber,
  comment,
  commitId
) => {
  try {
    const octokit = await getOctokit();

    const payload = {
      owner: repoOwner,
      repo: repoName,
      pull_number: pullRequestNumber,
      body: comment.comment,
      path: comment.filename,
    };

    // Include commit ID and position if available
    if (commitId) {
      payload.commit_id = commitId;
      payload.position = comment.line; // Ensure position is calculated
    } else {
      payload.line = comment.line;
      payload.side = "RIGHT"; // Default to right side
    }

    const response = await octokit.request(
      `POST /repos/{owner}/{repo}/pulls/{pull_number}/comments`,
      payload
    );

    console.log("Comment posted successfully:", response.data);
  } catch (error) {
    console.error("Error posting comment:", error.message);
  }
};

module.exports = {
  webhookHandler,
};
