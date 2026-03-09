// src/config/api.js
const API_BASE_URL =
process.env.REACT_APP_API_URL ?? "http://localhost:8000";

export const API_BASE = API_BASE_URL;
export const ARTICLES_ENDPOINT = `${API_BASE_URL}/articles`;
export const RATINGS_ENDPOINT = `${API_BASE_URL}/ratings`;
export const TAGS_ENDPOINT = `${API_BASE_URL}/tags`;
export const COMMENTS_ENDPOINT = `${API_BASE_URL}/comments`; 
export const USERS_ENDPOINT = `${API_BASE_URL}/users`;
export const CATEGORIES_ENDPOINT = `${API_BASE_URL}/categories`;
