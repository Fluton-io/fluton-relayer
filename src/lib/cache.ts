const priceCache = new Map<string, number>();

export const getCachedPrice = (cacheKey: string) => {
  if (priceCache.has(cacheKey)) {
    return priceCache.get(cacheKey) as number;
  }
  return null;
};

export const setCachedPrice = (cacheKey: string, price: number) => {
  priceCache.set(cacheKey, price);
};
