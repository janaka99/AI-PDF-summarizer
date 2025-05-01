import { APP_PROPERTISE } from "@/app-config";

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(APP_PROPERTISE.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

export async function countGeminiTokens(text: string) {
  const { totalTokens } = await model.countTokens(text);
  console.log(totalTokens);
  return totalTokens;
}
