const priceCache = new Map<string, { price: number; timestamp: number }>();

export const getCachedPrice = (cacheKey: string) => {
  if (priceCache.has(cacheKey)) {
    const { price, timestamp } = priceCache.get(cacheKey) as { price: number; timestamp: number };
    const currentTime = Date.now();

    // Invalidating cache if the price is older than 60 seconds
    if (currentTime - timestamp > 60 * 1000) {
      priceCache.delete(cacheKey);
      return null;
    }

    return price;
  }
  return null;
};

export const setCachedPrice = (cacheKey: string, price: number) => {
  priceCache.set(cacheKey, { price, timestamp: Date.now() });
};
