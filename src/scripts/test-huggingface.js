const dotenv = require("dotenv");
const { HfInference } = require("@huggingface/inference");

// Load env vars
dotenv.config({ path: ".env.local" });

async function testHuggingFace() {
  try {
    if (!process.env.HF_API_KEY) {
      console.error("No Hugging Face API key found in .env.local");
      console.error(
        "Get a free API key at: https://huggingface.co/settings/tokens"
      );
      return;
    }

    // Create client
    const hf = new HfInference(process.env.HF_API_KEY);

    console.log("Testing Hugging Face API...");

    // Send a simple test prompt using chat completion
    const response = await hf.chatCompletion({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: [{ role: "user", content: "Hello, what is today's date?" }],
      max_tokens: 100,
      temperature: 0.7,
    });

    console.log("Response:", response.choices[0].message.content);
  } catch (error) {
    console.error("Error testing Hugging Face:", error.message);

    if (error.message.includes("401")) {
      console.error("API key is invalid");
      console.error(
        "Get a free API key at: https://huggingface.co/settings/tokens"
      );
    } else if (error.message.includes("429")) {
      console.error("Rate limit exceeded");
    }
  }
}

testHuggingFace();
