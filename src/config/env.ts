import dotenv from "dotenv";

dotenv.config();

export const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
export const BACKEND_URL = process.env.BACKEND_URL;
export const PORT = process.env.PORT || 3001;

if (!PRIVATE_KEY) {
  throw new Error("Private key is not given. Please define it in .env");
}

if (!BACKEND_URL) {
  throw new Error("Backend URL is not given. Please define it in .env");
}
