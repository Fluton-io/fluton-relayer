const priceCache = new Map();

export const getCachedPrice = (cacheKey: string) => {
  if (priceCache.has(cacheKey)) {
    return priceCache.get(cacheKey);
  }
  return null;
};

export const setCachedPrice = (cacheKey: string, price: number) => {
  priceCache.set(cacheKey, price);
};
