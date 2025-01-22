const openAIClient = require("../config/openai");

const analyzeCodeWithOpenAI = async (files) => {
  const comments = [];

  for (const file of files) {
    // Create a detailed prompt for PR review
    const prompt = `
   Your task is to review the code in the following file and provide actionable comments to improve its quality. Focus on the following aspects:
  
  1. Remove unnecessary console logs and commented-out code.
  2. Ensure the code follows the Single Responsibility Principle (SRP).
  3. Identify and suggest improvements for:
     - Code readability and maintainability.
     - Function and variable naming conventions.
     - Consistency in coding style (e.g., indentation, braces, etc.).
     - Proper error handling and edge case management.
  4. Highlight any redundant code or unused variables.
  5. Suggest performance optimizations where applicable.
  
  Here is the code to review:
  
  File: ${file.filename}
  
  ${file.content}
  
  Provide a review in the form of actionable comments. Be concise but clear in your suggestions.
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
      max_tokens: 500,
    });

    console.log(response?.data?.choices[0]);
    console.log("-----------------------");
    comments.push({
      path: file.filename,
      body: response.data.choices[0].text.trim(),
      position: 1, // Adjust this to target the correct line number
    });
  }

  return comments;
};
module.exports = {
  analyzeCodeWithOpenAI,
};
