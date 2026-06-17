import { NetworkType } from '../types';

// Celo Mainnet: 42220 (0xa4ec)
// Celo Alfajores Testnet: 44787 (0xaef3)
export const CELO_MAINNET_CHAIN_ID = '0xa4ec';
export const CELO_ALFAJORES_CHAIN_ID = '0xaef3';

// Native USDT Celo ERC-20 Token Addresses
export const USDT_ADDRESSES = {
  mainnet: '0x48065fbBE25f71C92829939886a3623D3F14E156',
  testnet: '0xe28cef573d0ed6a9056a218d837651c6c53569db' // Common mock/faucet stablecoin representation on Alfajores
};

/**
 * Pads a hex string to 64 characters (32 bytes) for ABI encoding.
 */
function padTo64Chars(str: string): string {
  const clean = str.replace(/^0x/, '').toLowerCase();
  return clean.padStart(64, '0');
}

/**
 * Encodes ERC-20 transfer(address,uint256) data parameter.
 * Selector for transfer(address,uint256) is 0xa9059cbb
 */
export function encodeERC20Transfer(recipient: string, amount: number, decimals: number = 6): string {
  // Convert standard decimal amount to raw integer
  const rawAmountBytes = Math.round(amount * Math.pow(10, decimals));
  const hexAmount = rawAmountBytes.toString(16);
  
  const selector = '0xa9059cbb';
  const paddedAddress = padTo64Chars(recipient);
  const paddedAmount = padTo64Chars(hexAmount);
  
  return selector + paddedAddress + paddedAmount;
}

/**
 * Standard utility to query details from injected EIP-1193 window.ethereum
 */
export async function getInjectedEthereum() {
  if (typeof window !== 'undefined' && 'ethereum' in window) {
    return (window as any).ethereum;
  }
  return null;
}

/**
 * Safely requests account connection
 */
export async function connectInjectedWallet(): Promise<string | null> {
  const eth = await getInjectedEthereum();
  if (!eth) return null;
  
  try {
    const accounts = await eth.request({ method: 'eth_requestAccounts' });
    if (accounts && accounts.length > 0) {
      return accounts[0];
    }
  } catch (error) {
    console.error("Failed to connect wallet", error);
  }
  return null;
}

/**
 * Resolves current chain ID and maps to NetworkType
 */
export async function getWalletNetwork(): Promise<NetworkType> {
  const eth = await getInjectedEthereum();
  if (!eth) return 'mainnet';
  
  try {
    const chainId = await eth.request({ method: 'eth_chainId' });
    if (chainId === CELO_ALFAJORES_CHAIN_ID) {
      return 'testnet';
    }
  } catch (e) {
    console.warn("Could not retrieve chain ID, default to mainnet", e);
  }
  return 'mainnet';
}

/**
 * Queries native CELO balance of an address on-chain.
 */
export async function getNativeCeloBalance(address: string): Promise<number> {
  const eth = await getInjectedEthereum();
  if (!eth) return 0;
  try {
    const rawBalHex = await eth.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    });
    if (rawBalHex) {
      const wei = parseInt(rawBalHex, 16);
      return isNaN(wei) ? 0 : wei / 1e18;
    }
  } catch (e) {
    console.error("Failed to fetch CELO balance", e);
  }
  return 0;
}

/**
 * Queries USDT balance of an address on-chain.
 */
export async function getUsdtBalance(address: string, network: NetworkType): Promise<number> {
  const eth = await getInjectedEthereum();
  if (!eth) return 0;
  
  const tokenContract = network === 'mainnet' ? USDT_ADDRESSES.mainnet : USDT_ADDRESSES.testnet;
  
  // Selector for balanceOf(address) is 0x70a08231
  // Followed by 32 byte padded address
  const cleanAddr = address.replace(/^0x/, '').toLowerCase().padStart(64, '0');
  const data = '0x70a08231' + cleanAddr;
  
  try {
    const balanceHex = await eth.request({
      method: 'eth_call',
      params: [
        {
          to: tokenContract,
          data: data
        },
        'latest'
      ]
    });
    if (balanceHex && balanceHex !== '0x') {
      const rawInt = BigInt(balanceHex);
      // USDT on Celo is typically 6 decimals
      return Number(rawInt) / 1e6;
    }
  } catch (e) {
    console.error("Failed to fetch USDT token balance", e);
  }
  return 0;
}

/**
 * Triggers switch chain or prompts user to add Celo
 */
export async function switchOrAddCeloNetwork(network: NetworkType): Promise<boolean> {
  const eth = await getInjectedEthereum();
  if (!eth) return false;
  
  const targetChainId = network === 'mainnet' ? CELO_MAINNET_CHAIN_ID : CELO_ALFAJORES_CHAIN_ID;
  const targetName = network === 'mainnet' ? 'Celo Mainnet' : 'Celo Alfajores Testnet';
  const rpcUrls = network === 'mainnet' ? ['https://forno.celo.org'] : ['https://alfajores-forno.celo-testnet.org'];
  const blockExplorerUrls = network === 'mainnet' ? ['https://celoscan.io'] : ['https://alfajores.celoscan.io'];
  const currencySymbol = 'CELO';
  
  try {
    // Attempt switch
    await eth.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: targetChainId }]
    });
    return true;
  } catch (switchError: any) {
    // Error code 4902 indicates chain hasn't been added
    if (switchError.code === 4902) {
      try {
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: targetChainId,
            chainName: targetName,
            nativeCurrency: {
              name: 'Celo Coin',
              symbol: currencySymbol,
              decimals: 18
            },
            rpcUrls,
            blockExplorerUrls
          }]
        });
        return true;
      } catch (addError) {
        console.error("Failed to add network to wallet", addError);
      }
    }
    console.error("Failed to switch network", switchError);
  }
  return false;
}

/**
 * Checks if the wallet is currently connected on the Celo Mainnet or Testnet
 */
export async function getConnectedAddress(): Promise<string | null> {
  const eth = await getInjectedEthereum();
  if (!eth) return null;
  
  try {
    const accounts = await eth.request({ method: 'eth_accounts' });
    if (accounts && accounts.length > 0) {
      return accounts[0];
    }
  } catch (e) {
    console.warn("Could not check connected addresses", e);
  }
  return null;
}
