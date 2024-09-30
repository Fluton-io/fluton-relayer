import axios from "axios";
import { BACKEND_URL } from "../config/env";
import { getWalletAddress } from "./socket";

export const saveRelayerAddress = async () => {
  const walletAddress = getWalletAddress();
  await axios.post(`${BACKEND_URL}/save-relayer`, {
    walletAddress,
  });
};

export const deleteRelayerAddress = async () => {
  const walletAddress = getWalletAddress();
  await axios.delete(`${BACKEND_URL}/delete-relayer?walletAddress=${walletAddress}`);
};
