// src/config/api.js
const API_BASE_URL =
process.env.REACT_APP_API_URL ?? "http://localhost:8000";

export const API_BASE = API_BASE_URL;
export const ARTICLES_ENDPOINT = `${API_BASE_URL}/articles`;
