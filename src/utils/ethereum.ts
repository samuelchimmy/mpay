import { NetworkType } from '../types';
import { providers, Contract, utils } from 'ethers';

// Celo Mainnet: 42220 (0xa4ec)
// Celo Sepolia Testnet: 11142220 (0xaa044c)
export const CELO_MAINNET_CHAIN_ID_HEX = '0xa4ec';
export const CELO_MAINNET_CHAIN_ID_DEC = '42220';
export const CELO_SEPOLIA_CHAIN_ID_HEX = '0xaa044c';
export const CELO_SEPOLIA_CHAIN_ID_DEC = '11142220';

export const RPC_URLS = {
  mainnet: 'https://forno.celo.org',
  testnet: 'https://forno.celo-sepolia.celo-testnet.org'
};

// Native USDT Celo ERC-20 Token Addresses
export const USDT_ADDRESSES = {
  mainnet: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e',
  testnet: '0xd077A400968890Eacc75cdc901F0356c943e4fDb'
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
    const chainIdStr = String(chainId).toLowerCase();
    if (
      chainIdStr === CELO_SEPOLIA_CHAIN_ID_HEX || 
      chainIdStr === CELO_SEPOLIA_CHAIN_ID_DEC ||
      chainIdStr === '11142220' ||
      chainIdStr === '0xaa044c'
    ) {
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
export async function getNativeCeloBalance(address: string, network: NetworkType = 'mainnet'): Promise<number> {
  const eth = await getInjectedEthereum();
  
  // 1. Prioritize Web3Provider from injected wallet (highly reliable, no public rate-limits)
  if (eth) {
    try {
      const provider = new providers.Web3Provider(eth);
      const rawBal = await provider.getBalance(address);
      return parseFloat(utils.formatEther(rawBal));
    } catch (e) {
      console.warn("Web3Provider failed to fetch CELO balance, falling back to public RPC", e);
    }
  }

  // 2. Fallback to public RPC
  const rpcUrl = RPC_URLS[network] || RPC_URLS.mainnet;
  try {
    const provider = new providers.JsonRpcProvider(rpcUrl);
    const rawBal = await provider.getBalance(address);
    return parseFloat(utils.formatEther(rawBal));
  } catch (e) {
    console.error("Failed to fetch CELO balance from public RPC", e);
  }
  return 0;
}

/**
 * Queries USDT balance of an address on-chain.
 */
export async function getUsdtBalance(address: string, network: NetworkType): Promise<number> {
  const tokenContract = network === 'mainnet' ? USDT_ADDRESSES.mainnet : USDT_ADDRESSES.testnet;
  const decimals = network === 'mainnet' ? 6 : 6;
  const eth = await getInjectedEthereum();

  // 1. Prioritize Web3Provider from injected wallet
  if (eth) {
    try {
      const provider = new providers.Web3Provider(eth);
      const contract = new Contract(
        tokenContract,
        ['function balanceOf(address) view returns (uint256)'],
        provider
      );
      const rawBal = await contract.balanceOf(address);
      return Number(rawBal) / Math.pow(10, decimals);
    } catch (e) {
      console.warn("Web3Provider failed to fetch USDT balance, trying legacy eth_call", e);
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
          return Number(rawInt) / Math.pow(10, decimals);
        }
      } catch (innerErr) {
        console.error("Legacy USDT eth_call failed too", innerErr);
      }
    }
  }

  // 2. Fallback to public RPC
  const rpcUrl = RPC_URLS[network] || RPC_URLS.mainnet;
  try {
    const provider = new providers.JsonRpcProvider(rpcUrl);
    const contract = new Contract(
      tokenContract,
      ['function balanceOf(address) view returns (uint256)'],
      provider
    );
    const rawBal = await contract.balanceOf(address);
    return Number(rawBal) / Math.pow(10, decimals);
  } catch (e) {
    console.error("Failed to fetch USDT balance from public RPC", e);
  }
  return 0;
}

/**
 * Triggers switch chain or prompts user to add Celo
 */
export async function switchOrAddCeloNetwork(network: NetworkType): Promise<boolean> {
  const eth = await getInjectedEthereum();
  if (!eth) return false;
  
  const targetChainId = network === 'mainnet' ? CELO_MAINNET_CHAIN_ID_HEX : CELO_SEPOLIA_CHAIN_ID_HEX;
  const targetName = network === 'mainnet' ? 'Celo Mainnet' : 'Celo Sepolia Testnet';
  const rpcUrls = network === 'mainnet' ? ['https://forno.celo.org'] : ['https://forno.celo-sepolia.celo-testnet.org'];
  const blockExplorerUrls = network === 'mainnet' ? ['https://celoscan.io'] : ['https://celo-sepolia.blockscout.com'];
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
    if (switchError.code === 4902 || switchError.code === -32603) {
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
