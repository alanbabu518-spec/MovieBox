import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY is not configured");
}

const groq = new Groq({
  apiKey,
});

export type MovieAIRequest = {
  movieTitle: string;
  overview: string;
  question: string;
};

export type MovieAIResponse = {
  answer: string;
};

export const askMovieAI = async (
  request: MovieAIRequest,
): Promise<MovieAIResponse> => {
  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content:
          "You are MovieBox AI, a helpful movie assistant. Answer movie-related questions clearly and concisely. Use the provided movie information as context and do not invent movie-specific facts that are not supported by it.",
      },
      {
        role: "user",
        content: `
Movie title:
${request.movieTitle}

Movie overview:
${request.overview}

User question:
${request.question}
`,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return {
    answer:
      response.choices[0]?.message?.content ??
      "Unable to generate an answer.",
  };
};