const openAIClient = require("../config/openai");
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const analyzeCodeWithOpenAI = async (files) => {
  const Comment = z.object({
    filename: z.string(),
    line: z.number().positive(),
    comment: z.string(),
  });

  const ReviewComments = z.array(Comment);

  const comments = [];

  for (const file of files) {
    const prompt = `
      You are a code reviewer. Your task is to review the following file and provide concise actionable comments. Follow these rules:
      
      1. For each suggestion, specify the line number and the comment.
      2. Avoid multiple comments for the same line.
      2. comments should be concise and well summarized.
      3. Limit the response to a maximum of 5 comments per file.
      4. Return the result in the following JSON format:
      [
        {
          "filename": "<filename>",
          "line": <line_number>,
          "comment": "<comment>"
        },
        ...
      ]
      

      Points to check in review:
      1. Remove unnecessary console logs and commented-out code.
      2. Ensure adherence to the Single Responsibility Principle (SRP).
      3. Improve code readability, naming conventions, and consistency.
      4. Suggest optimizations and identify redundancies.
  
      
      
      Here is the code:
      
      File: ${file.filename}
      
      ${file.content}
    `;

    try {
      // Generate the completion with structured response
      const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-2024-08-06",
        messages: [
          {
            role: "system",
            content: "You are a helpful and concise code reviewer.",
          },
          { role: "user", content: prompt.trim() },
        ],
        response_format: zodResponseFormat(ReviewComments, "review_comments"),
      });

      const parsedComments = completion.choices[0].message.parsed;

      console.log("parsed comments: ", parsedComments);
      comments.push(...parsedComments);
    } catch (error) {
      console.error("Error parsing OpenAI response:", error.message);
    }
  }

  return comments;
};

export default analyzeCodeWithOpenAI;

module.exports = {
  analyzeCodeWithOpenAI,
};
