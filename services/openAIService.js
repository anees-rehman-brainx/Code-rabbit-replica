const openAIClient = require("../config/openai");

const analyzeCodeWithOpenAI = async (files) => {
  const comments = [];

  for (const file of files) {
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
      //   max_tokens: 500,
    });
    comments.push({
      path: file.filename,
      body: response.choices[0].message?.content,
      line: 2, // Adjust this to target the correct line number
    });
  }

  return comments;
};
module.exports = {
  analyzeCodeWithOpenAI,
};
