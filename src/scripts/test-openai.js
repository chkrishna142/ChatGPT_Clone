const dotenv = require("dotenv");
const OpenAI = require("openai").default;

// Load env vars
dotenv.config({ path: ".env.local" });

async function testOpenAI() {
  try {
    // Create client
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Send a simple test prompt
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "What is today's date?" },
      ],
    });

    console.log("Response:", response.choices[0].message.content);
  } catch (error) {
    console.error("Error testing OpenAI:", error.message);

    if (error.status === 401) {
      console.error("API key is invalid or expired");
    } else if (error.status === 429) {
      console.error("Quota exceeded - add credits to your OpenAI account");
      console.error("Go to: https://platform.openai.com/account/billing");
    } else if (error.status === 403) {
      console.error("Access denied - check your API key permissions");
    }
  }
}

testOpenAI();
