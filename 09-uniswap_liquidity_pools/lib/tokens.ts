import { Token } from "@uniswap/sdk-core";

export type SwapToken = Token & { logoURI?: string };

export const DEFAULT_TOKEN_LIST_URL = "https://tokens.uniswap.org";
const TOKEN_CACHE_TTL_MS = 100 * 60 * 1000;

type TokenCacheEntry = {
  tokens: SwapToken[];
  fetchedAt: number;
};

const tokenCache = new Map<number, TokenCacheEntry>();

const tokenInfoToSdkToken = (info: any): SwapToken => {
  const token = new Token(
    info.chainId,
    info.address,
    info.decimals,
    info.symbol,
    info.name ?? info.symbol,
  );

  return Object.assign(token, {
    logoURI: info.logoURI,
  });
};

const downloadTokenList = async (url: string): Promise<any> => {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Unable to fetch token list (${response.status})`);
  }

  return await response.json();
};

export const getSwapTokens = async (
  chainId = 1,
  url: string = DEFAULT_TOKEN_LIST_URL,
): Promise<SwapToken[]> => {
  const cached = tokenCache.get(chainId);

  if (cached && Date.now() - cached.fetchedAt < TOKEN_CACHE_TTL_MS) {
    return cached.tokens;
  }

  try {
    const tokenList = await downloadTokenList(url);

    const tokens = tokenList.tokens
      .filter((tokenInfo: any) => tokenInfo.chainId === chainId)
      .map(tokenInfoToSdkToken);

    tokenCache.set(chainId, {
      tokens,
      fetchedAt: Date.now(),
    });

    return tokens;
  } catch (error) {
    if (cached) {
      return cached.tokens;
    }

    throw error;
  }
};

export const findTokenBySymbol = (
  tokens: SwapToken[],
  symbol: string,
): SwapToken | undefined =>
  tokens.find((token) => token.symbol?.toLowerCase() === symbol.toLowerCase());
