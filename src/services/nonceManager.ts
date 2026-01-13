import { publicClients, account } from "../config/client";

interface NonceState {
  currentNonce: number;
  pendingCount: number;
}

class NonceManager {
  private noncesByChain: Map<number, NonceState> = new Map();
  private locks: Map<number, Promise<void>> = new Map();
  private lockResolvers: Map<number, () => void> = new Map();

  /**
   * Gets the next available nonce for a chain, handling concurrent requests safely.
   * This method ensures that even when multiple transactions are submitted simultaneously,
   * each one receives a unique, sequential nonce.
   */
  async getNextNonce(chainId: number): Promise<number> {
    // Wait for any pending operation on this chain to complete
    await this.acquireLock(chainId);

    try {
      let state = this.noncesByChain.get(chainId);

      if (!state) {
        // Initialize nonce from the blockchain
        const nonce = await this.fetchNonceFromChain(chainId);
        state = { currentNonce: nonce, pendingCount: 0 };
        this.noncesByChain.set(chainId, state);
      }

      const nonceToUse = state.currentNonce;
      state.currentNonce++;
      state.pendingCount++;

      console.log(`[NonceManager] Chain ${chainId}: Assigned nonce ${nonceToUse}, pending: ${state.pendingCount}`);

      return nonceToUse;
    } finally {
      this.releaseLock(chainId);
    }
  }

  /**
   * Call this when a transaction is confirmed to update pending count
   */
  confirmTransaction(chainId: number): void {
    const state = this.noncesByChain.get(chainId);
    if (state && state.pendingCount > 0) {
      state.pendingCount--;
      console.log(`[NonceManager] Chain ${chainId}: Transaction confirmed, pending: ${state.pendingCount}`);
    }
  }

  /**
   * Call this when a transaction fails to potentially reset the nonce
   */
  async handleTransactionFailure(chainId: number, usedNonce: number): Promise<void> {
    await this.acquireLock(chainId);

    try {
      const state = this.noncesByChain.get(chainId);
      if (state) {
        state.pendingCount = Math.max(0, state.pendingCount - 1);

        // Re-fetch nonce from chain to sync state if there are no pending transactions
        if (state.pendingCount === 0) {
          const actualNonce = await this.fetchNonceFromChain(chainId);
          state.currentNonce = actualNonce;
          console.log(`[NonceManager] Chain ${chainId}: Reset nonce to ${actualNonce} after failure`);
        }
      }
    } finally {
      this.releaseLock(chainId);
    }
  }

  /**
   * Force reset the nonce for a chain by fetching from the blockchain
   */
  async resetNonce(chainId: number): Promise<void> {
    await this.acquireLock(chainId);

    try {
      const nonce = await this.fetchNonceFromChain(chainId);
      this.noncesByChain.set(chainId, { currentNonce: nonce, pendingCount: 0 });
      console.log(`[NonceManager] Chain ${chainId}: Force reset nonce to ${nonce}`);
    } finally {
      this.releaseLock(chainId);
    }
  }

  /**
   * Get current state for debugging
   */
  getState(chainId: number): NonceState | undefined {
    return this.noncesByChain.get(chainId);
  }

  private async fetchNonceFromChain(chainId: number): Promise<number> {
    const publicClient = publicClients.find((pc) => pc.chainId === chainId)?.client;

    if (!publicClient) {
      throw new Error(`[NonceManager] No public client found for chainId ${chainId}`);
    }

    const nonce = await publicClient.getTransactionCount({
      address: account.address,
      blockTag: "pending",
    });

    console.log(`[NonceManager] Chain ${chainId}: Fetched nonce from chain: ${nonce}`);
    return nonce;
  }

  private async acquireLock(chainId: number): Promise<void> {
    // Wait for existing lock to be released
    while (this.locks.has(chainId)) {
      await this.locks.get(chainId);
    }

    // Create a new lock
    let resolver: () => void;
    const lockPromise = new Promise<void>((resolve) => {
      resolver = resolve;
    });
    this.locks.set(chainId, lockPromise);
    this.lockResolvers.set(chainId, resolver!);
  }

  private releaseLock(chainId: number): void {
    const resolver = this.lockResolvers.get(chainId);
    if (resolver) {
      this.locks.delete(chainId);
      this.lockResolvers.delete(chainId);
      resolver();
    }
  }
}

// Export a singleton instance
export const nonceManager = new NonceManager();
