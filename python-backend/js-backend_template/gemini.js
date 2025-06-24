import {
  GoogleGenerativeAI,
  GoogleGenerativeAIFetchError,
} from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const googleGenAi = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = googleGenAi.getGenerativeModel({ model: "gemini-1.5-flash" });

async function chatCompletion(prompt) {
  console.log(prompt);
  try {
    const chatCompletion = await model.generateContent(prompt);
    console.log(chatCompletion);
    return chatCompletion.choices[0].message.content;
  } catch (error) {
    if (error instanceof GoogleGenerativeAIFetchError) {
      console.error({
        status: 503,
        statusText: "Service Unavailable",
        errorDetails: error.message,
      });
      throw new Error("Service is busy, please try again later.");
    } else {
      console.error(error);
      throw new Error("An unexpected error occurred.");
    }
  }
}

export default chatCompletion;
