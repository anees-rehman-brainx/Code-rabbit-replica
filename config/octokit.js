// octokit.js (in config folder)
module.exports = async () => {
  const { Octokit } = await import("octokit"); // Dynamically import Octokit

  const octokit = new Octokit({
    auth: process.env.GITHUB_ACCESS_TOKEN, // Your GitHub token
  });

  return octokit;
};
