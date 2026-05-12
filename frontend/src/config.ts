const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  ?? (import.meta.env.DEV ? 'http://localhost:8000' : '');

export const APP_CONFIG = {
  apiBaseUrl: apiBaseUrl ? trimTrailingSlash(apiBaseUrl) : '',
  contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS?.trim() ?? '',
  network: {
    chainId: Number(import.meta.env.VITE_CHAIN_ID ?? 51),
    chainIdHex: import.meta.env.VITE_CHAIN_ID_HEX?.trim() ?? '0x33',
    chainName: import.meta.env.VITE_CHAIN_NAME?.trim() ?? 'XDC Apothem Testnet',
    rpcUrl: import.meta.env.VITE_RPC_URL?.trim() ?? 'https://rpc.apothem.network',
    blockExplorerUrl: import.meta.env.VITE_BLOCK_EXPLORER_URL?.trim() ?? 'https://apothem.xdcscan.io',
    nativeCurrency: {
      name: import.meta.env.VITE_NATIVE_CURRENCY_NAME?.trim() ?? 'XDC',
      symbol: import.meta.env.VITE_NATIVE_CURRENCY_SYMBOL?.trim() ?? 'XDC',
      decimals: Number(import.meta.env.VITE_NATIVE_CURRENCY_DECIMALS ?? 18),
    },
  },
} as const;

export const getApiUrl = (path: string) => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return APP_CONFIG.apiBaseUrl
    ? `${APP_CONFIG.apiBaseUrl}${normalizedPath}`
    : normalizedPath;
};

export const getExplorerUrl = (type: 'tx' | 'address', value: string) => {
  const baseUrl = trimTrailingSlash(APP_CONFIG.network.blockExplorerUrl);
  return `${baseUrl}/${type}/${value}`;
};
