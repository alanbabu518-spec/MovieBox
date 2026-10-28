import OpenAI from "openai";

const apiKey = process.env.NVIDIA_API_KEY?.trim();

if (!apiKey) {
  throw new Error("NVIDIA_API_KEY is missing from the server environment.");
}

export const nvidiaClient = new OpenAI({
  apiKey,
  baseURL:
    process.env.NVIDIA_BASE_URL?.trim() ||
    "https://integrate.api.nvidia.com/v1",
  timeout: 12_000,
  maxRetries: 0,
});
