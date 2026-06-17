/**
 * Type declarations for mPay, the USDT mini-app on Celo.
 */

export interface Contact {
  id: string;
  name: string;      // Human name
  moniTag: string;   // e.g. @samuel or @celo
  address: string;   // Celo wallet address
  avatarEmoji: string;
  avatarBg: string;  // Tailwind color class
}

export interface Transaction {
  id: string;
  recipientAddress: string;
  recipientName: string;
  moniTag: string;
  amount: number;
  timestamp: string;
  status: 'pending' | 'success' | 'failed';
  txHash: string;
  network: 'mainnet' | 'testnet';
  isSimulated: boolean;
  isReceive?: boolean;
}

export type NetworkType = 'mainnet' | 'testnet';

export interface WalletState {
  address: string | null;
  network: NetworkType;
  usdtBalance: number;
  celoBalance: number;
  isSandbox: boolean; // Keep for interface compatibility if needed, but set to false
  status: 'disconnected' | 'connecting' | 'connected';
}
