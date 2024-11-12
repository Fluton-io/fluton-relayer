import dotenv from "dotenv";
import { privateKeyToAddress } from "viem/accounts";

dotenv.config();

export const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;

export const walletAddress = privateKeyToAddress(PRIVATE_KEY!);

export const BACKEND_URL = process.env.BACKEND_URL;
export const PORT = process.env.PORT || 3001;

export const ODOS_API_URL = process.env.ODOS_API_URL;
export const ONEINCH_API_URL = process.env.ONEINCH_API_URL;

export const INFURA_API_KEY = process.env.INFURA_API_KEY;
export const ONEINCH_API_KEY = process.env.ONEINCH_API_KEY;

if (!PRIVATE_KEY) {
  throw new Error("Private key is not given. Please define it in .env");
}

if (!BACKEND_URL) {
  throw new Error("Backend URL is not given. Please define it in .env");
}
