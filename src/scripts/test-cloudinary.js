// scripts/test-cloudinary.js
require("dotenv").config({ path: ".env.local" });
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function run() {
  try {
    console.log(
      "Cloud name:",
      process.env.CLOUDINARY_CLOUD_NAME ? "FOUND" : "MISSING"
    );
    const res = await cloudinary.uploader.upload(
      "/Users/krishnach/Downloads/flare.svg",
      { folder: "galaxy-chat-tests" }
    );
    console.log("✅ Upload success:", res.secure_url);
  } catch (err) {
    console.error("❌ Upload failed:", err);
  }
}

run();
