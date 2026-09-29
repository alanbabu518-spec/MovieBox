export const movieIndustries = {
  hollywood: {
    language: "en",
    region: "US",
  },
  bollywood: {
    language: "hi",
    region: "IN",
  },
  kollywood: {
    language: "ta",
    region: "IN",
  },
  tollywood: {
    language: "te",
    region: "IN",
  },
  mollywood: {
    language: "ml",
    region: "IN",
  },
  kdrama: {
    language: "ko",
    region: "KR",
  },
} as const;

export type MovieIndustry =
  keyof typeof movieIndustries;

export function isMovieIndustry(
  value: string,
): value is MovieIndustry {
  return value in movieIndustries;
}