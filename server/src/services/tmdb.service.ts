import axios from "axios";
import { tmdbConfig } from "../config/tmdb.js";

export const tmdbClient = axios.create({
  baseURL: tmdbConfig.baseUrl,
  params: {
    api_key: tmdbConfig.apiKey,
  },
  timeout: 10000,
});