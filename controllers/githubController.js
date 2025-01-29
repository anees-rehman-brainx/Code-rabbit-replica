const { GITHUB_ACTIONS } = require("../constants");
const axios = require("axios");
const { openAIService } = require("../services");
const getOctokit = require("../config/octokit");

const webhookHandler = async (req, res) => {
  try {
    // Parse GitHub webhook payload
    const { action, pull_request, repository, after, before } = req.body;
    if (
      action === GITHUB_ACTIONS.OPENED ||
      action === GITHUB_ACTIONS.SYNCHRONIZE
    ) {
      const owner = repository.owner.login;
      const repo = repository.name;
      const pullNumber = pull_request.number;
      const commitId = after;

      console.log(
        "owner: " +
          owner +
          "  repo: " +
          repo +
          "   pullNumber: " +
          pullNumber +
          "    commit: " +
          commitId
      );

      // Step 1: Fetch PR Files
      const files = await fetchPRFiles(
        owner,
        repo,
        pullNumber,
        pull_request.head.sha,
        commitId ? true : false
      );

      // console.log("files", JSON.stringify(files));

      // Step 2: Analyze Files with OpenAI
      const comments = await openAIService.analyzeCodeWithOpenAI(files);

      console.log("comments", comments);

      // Step 3: Post Comments on GitHub PR
      if (comments && comments?.length) {
        for (const comment of comments) {
          await postCommentOnPR(owner, repo, pullNumber, comment, commitId);
        }
      }
    }

    res.status(200).send("Webhook processed");
  } catch (error) {
    console.error("Error in webhookHandler:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const fetchPRFiles = async (owner, repo, pullNumber, sha, isCommit = false) => {
  try {
    let url = isCommit
      ? `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`
      : `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
      },
    });

    if (isCommit) {
      return response.data.files.map((file) => ({
        filename: file.filename,
        content: file.patch || "", // Diff content (if available)
        // changes: parseDiff(file.patch),
      }));
    } else {
      return response.data.map((file) => ({
        filename: file.filename,
        content: file.patch || "", // Diff content (if available)
        // changes: parseDiff(file.patch),
      }));
    }
  } catch (error) {
    console.error("Error fetching PR or commit files:", error.message);
    throw error;
  }
};

const postCommentOnPR = async (
  repoOwner,
  repoName,
  pullRequestNumber,
  comment,
  commitId
) => {
  try {
    const octokit = await getOctokit(); // Get the octokit instance

    // console.log("comment", comment);
    const response = await octokit.request(
      `POST /repos/{owner}/{repo}/pulls/{pull_number}/comments`,
      {
        owner: repoOwner,
        repo: repoName,
        pull_number: pullRequestNumber,
        body: comment.body,
        commit_id: commitId,
        path: comment.path,
        start_line: comment.start_line,
        start_side: "RIGHT",
        line: comment.line,
        side: "RIGHT",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    console.log("Comment posted successfully:", response);
  } catch (error) {
    console.error("Error posting comment:", error);
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
    } else if (line.startsWith("-") && !line.startsWith("---")) {
    }
  });

  return changes;
};

module.exports = {
  webhookHandler,
};
