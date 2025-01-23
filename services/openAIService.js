const openAIClient = require("../config/openai");
const { z } = require("zod");
const { zodResponseFormat } = require("openai/helpers/zod");

const analyzeCodeWithOpenAI = async (files) => {
  const Comment = z.object({
    filename: z.string(),
    line: z.number().positive(),
    comment: z.string(),
  });

  const ReviewCommentsSchema = z.object({
    review_comments: z.array(Comment),
  });

  const comments = [];

  for (const file of files) {
    const prompt = `
      You are a code reviewer. Your task is to review the following file and provide concise actionable comments. Follow these rules:
      
      1. For each suggestion, specify the line number and the comment.
      2. Avoid multiple comments for the same line.
      3. Comments should be concise and well-summarized.
      4. Limit the response to a maximum of 5 comments per file.
      5. Return the result in the following JSON format:
      {
        "review_comments": [
          {
            "filename": "<filename>",
            "line": <line_number>,
            "comment": "<comment>"
          },
          ...
        ]
      }
      
      Points to check in the review:
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
      const completion = await openAIClient.beta.chat.completions.parse({
        model: "gpt-4o-2024-08-06",
        messages: [
          {
            role: "system",
            content: "You are a helpful and concise code reviewer.",
          },
          { role: "user", content: prompt.trim() },
        ],
        response_format: zodResponseFormat(
          ReviewCommentsSchema,
          "review_comments"
        ),
      });

      // Extract and add the parsed comments to the list
      const parsedComments =
        completion.choices[0].message.parsed.review_comments;

      console.log("Parsed comments:", parsedComments);
      comments.push(...parsedComments);
    } catch (error) {
      console.error("Error parsing OpenAI response:", error.message);
    }
  }

  return comments;
};

module.exports = {
  analyzeCodeWithOpenAI,
};
