const openAIClient = require("../config/openai");

const analyzeCodeWithOpenAI = async (files) => {
  const comments = [];

  for (const file of files) {
    // Extract diff hunk information from the patch content
    const diffHunk = extractDiffHunk(file.content);

    // Create a detailed prompt for PR review
    const prompt = `
        Your task is to review the following file and provide concise actionable comments in bullet points. Focus on these areas:
  
        1. Remove unnecessary console logs and commented-out code.
        2. Ensure adherence to the Single Responsibility Principle (SRP).
        3. Improve code readability, naming conventions, and consistency.
        4. Suggest optimizations and identify redundancies.
  
        Here is the code:
  
        File: ${file.filename}
  
        ${file.content}
  
        Provide only a summarized list of bullet points for improvement.
      `;

    const response = await openAIClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "assistant", content: "You are a code reviewer." },
        {
          role: "user",
          content: prompt.trim(),
        },
      ],
    });

    comments.push({
      path: file.filename,
      body: response.choices[0].message?.content,
      line: 2, // Adjust to correct line
      diff_hunk: diffHunk, // Include the diff hunk here
    });
  }

  return comments;
};

// Helper function to extract diff hunk
const extractDiffHunk = (patchContent) => {
  // Assuming the patch content is in a format similar to Git diffs:
  const hunkPattern = /@@ -(\d+),(\d+) \+(\d+),(\d+) @@/g;
  const hunks = [];
  let match;

  while ((match = hunkPattern.exec(patchContent)) !== null) {
    const startLine = parseInt(match[1], 10);
    const length = parseInt(match[2], 10);
    hunks.push({ startLine, length });
  }

  return hunks; // Return the list of diff hunks
};

module.exports = {
  analyzeCodeWithOpenAI,
};
