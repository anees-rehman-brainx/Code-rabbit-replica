const OpenAI = require("openai");

const openAIClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = openAIClient;
