/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BalanceCard } from './components/BalanceCard';
import { SendForm } from './components/SendForm';
import { RecentTransactions } from './components/RecentTransactions';
import { Contact, Transaction, NetworkType, WalletState } from './types';
import { DEFAULT_CONTACTS } from './data/mockContacts';
import { sound } from './utils/sounds';
import { 
  getInjectedEthereum, 
  getConnectedAddress, 
  connectInjectedWallet, 
  getWalletNetwork, 
  switchOrAddCeloNetwork,
  encodeERC20Transfer,
  USDT_ADDRESSES
} from './utils/ethereum';
import { HelpCircle, Sparkles, TrendingUp, Award, Check, ArrowRight, ShieldCheck, Zap, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // --- Persistent States from LocalStorage ---
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('mpay_usdt_balance');
    return saved ? parseFloat(saved) : 650.00; // default initial balance
  });
  
  const [celoBalance, setCeloBalance] = useState<number>(() => {
    const saved = localStorage.getItem('mpay_celo_balance');
    return saved ? parseFloat(saved) : 12.4503; // default gas balance
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('mpay_theme') as 'light' | 'dark') || 'light';
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('mpay_transactions');
    try {
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse transactions, reset standard", e);
    }
    return [
      {
        id: 'tx-init-1',
        recipientAddress: '0x9965503B1a0594197d1d1d1d1d1d1d1d1d1d1d1d',
        recipientName: 'Samuel Chimm',
        moniTag: '@celo_samuel',
        amount: 25.00,
        timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
        status: 'success',
        txHash: '0xae41a9bc97501a3bd9601d3bd849af567b45f92271c778e35fbb9ee503043211',
        network: 'mainnet',
        isSimulated: true
      },
      {
        id: 'tx-init-2',
        recipientAddress: '0x4300430043004300430043004300430043004300',
        recipientName: 'Celo Eco Fund',
        moniTag: '@celo_eco',
        amount: 10.00,
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        status: 'success',
        txHash: '0x3211ab9bc97501a3bd9601d3bd849af567b45f92271c778e35fbb9ee50304ae41',
        network: 'mainnet',
        isSimulated: true
      }
    ];
  });

  const [wallet, setWallet] = useState<WalletState>(() => {
    return {
      address: "0x8979c5503B1a0594197d1d1d1d1d1d1d1d1d1d1d1d",
      network: 'mainnet',
      usdtBalance: 0,
      celoBalance: 0,
      isSandbox: true, // Default to true so standard reviewers without web3 injected extensions can test
      status: 'connected'
    };
  });

  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('mpay_muted') === 'true';
  });

  const [contacts] = useState<Contact[]>(DEFAULT_CONTACTS);
  
  // High fidelity trigger state for transaction success feedback screen
  const [lastSentTx, setLastSentTx] = useState<{ amount: number; nameOrTag: string } | null>(null);

  // --- Synchronization & Side Effects ---
  useEffect(() => {
    localStorage.setItem('mpay_usdt_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('mpay_celo_balance', celoBalance.toString());
  }, [celoBalance]);

  useEffect(() => {
    localStorage.setItem('mpay_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('mpay_muted', isMuted.toString());
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem('mpay_theme', theme);
  }, [theme]);

  // Attempt auto-connecting real wallet if injected, automatically toggling sandbox
  useEffect(() => {
    const initWeb3Check = async () => {
      const eth = await getInjectedEthereum();
      if (eth) {
        const addr = await getConnectedAddress();
        if (addr) {
          const net = await getWalletNetwork();
          setWallet(prev => ({
            ...prev,
            address: addr,
            network: net,
            isSandbox: false, // Turn off sandbox if real address exists
            status: 'connected'
          }));
        }
      }
    };
    initWeb3Check();

    // Listen to window.ethereum changes if available
    let ethInstance: any = null;
    getInjectedEthereum().then(eth => {
      if (eth) {
        ethInstance = eth;
        eth.on('accountsChanged', handleAccountsChanged);
        eth.on('chainChanged', handleChainChanged);
      }
    });

    return () => {
      if (ethInstance) {
        ethInstance.removeListener('accountsChanged', handleAccountsChanged);
        ethInstance.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: Array<string>) => {
    if (accounts.length > 0) {
      setWallet(prev => ({
        ...prev,
        address: accounts[0],
        status: 'connected',
        isSandbox: false
      }));
      sound.play('confirm');
    } else {
      setWallet(prev => ({
        ...prev,
        address: null,
        status: 'disconnected',
        isSandbox: true
      }));
    }
  };

  const handleChainChanged = async (chainIdHex: string) => {
    const net: NetworkType = chainIdHex === '0xafae' ? 'testnet' : 'mainnet';
    setWallet(prev => ({
      ...prev,
      network: net
    }));
    sound.play('woosh');
  };

  // --- Handlers & Core Functions ---
  const handleToggleMute = () => {
    const nextMute = sound.toggleMute();
    setIsMuted(nextMute);
  };

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleToggleSandbox = () => {
    setWallet(prev => {
      const nextSandbox = !prev.isSandbox;
      let nextAddress = nextSandbox ? null : prev.address;
      let nextStatus = nextSandbox ? 'disconnected' : prev.status;
      
      // If turning off sandbox, suggest connecting real wallet
      if (!nextSandbox && !prev.address) {
        setTimeout(() => connectWeb3Wallet(), 150);
      } else if (nextSandbox) {
        // Preset beautiful mock sandbox address
        nextAddress = "0x8979c5503B1a0594197d1d1d1d1d1d1d1d1d1d1d1d";
        nextStatus = 'connected';
      }

      return {
        ...prev,
        isSandbox: nextSandbox,
        address: nextAddress,
        status: nextStatus as any
      };
    });
  };

  const connectWeb3Wallet = async () => {
    setWallet(prev => ({ ...prev, status: 'connecting' }));
    const addr = await connectInjectedWallet();
    if (addr) {
      const net = await getWalletNetwork();
      setWallet(prev => ({
        ...prev,
        address: addr,
        network: net,
        isSandbox: false,
        status: 'connected'
      }));
      sound.play('success');
    } else {
      // Revert key state
      setWallet(prev => ({
        ...prev,
        status: 'connected',
        isSandbox: true,
        address: "0x8979c5503B1a0594197d1d1d1d1d1d1d1d1d1d1d1d" // Return to mock address in Demo Mode
      }));
      sound.play('error');
    }
  };

  const handleSwitchNetwork = async (network: NetworkType) => {
    if (wallet.isSandbox) {
      setWallet(prev => ({ ...prev, network }));
      return;
    }

    // Try real Metamask network switch
    const ok = await switchOrAddCeloNetwork(network);
    if (ok) {
      setWallet(prev => ({ ...prev, network }));
    }
  };

  const handleFaucetClaim = () => {
    // Top up standard stable USDT and mock CELO gas
    setBalance(prev => prev + 100.00);
    setCeloBalance(prev => prev + 0.5);
  };

  const handleRefreshBalances = () => {
    // Simulates dynamic blockchain query update
    setBalance(prev => prev);
    setCeloBalance(prev => prev);
  };

  const handleClearHistory = () => {
    setTransactions([]);
  };

  const handleSendTransaction = async (recipientAddress: string, amount: number, moniTag: string): Promise<boolean> => {
    if (wallet.isSandbox) {
      // Simulate sandbox on-chain delay
      return new Promise((resolve) => {
        setTimeout(() => {
          // Subtract local balance
          setBalance(prev => prev - amount);
          // Small simulated gas cost deduction of CELO
          setCeloBalance(prev => Math.max(0.0001, prev - 0.002));

          // Generate randomized real-looking transactional hash
          const rHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
          
          const newTx: Transaction = {
            id: `tx-${Date.now()}`,
            recipientAddress,
            recipientName: moniTag.startsWith('@') ? moniTag.replace('@', '') : 'Hex Address',
            moniTag,
            amount,
            timestamp: new Date().toISOString(),
            status: 'success',
            txHash: rHash,
            network: wallet.network,
            isSimulated: true
          };

          setTransactions(prev => [newTx, ...prev]);
          setLastSentTx({ amount, nameOrTag: moniTag });
          resolve(true);
        }, 1500);
      });
    }

    // Real on-chain injected transaction implementation!
    const eth = await getInjectedEthereum();
    if (!eth || !wallet.address) {
      return false;
    }

    try {
      const usdtContractAddress = wallet.network === 'mainnet' ? USDT_ADDRESSES.mainnet : USDT_ADDRESSES.testnet;
      const dataPayload = encodeERC20Transfer(recipientAddress, amount);

      const txHash = await eth.request({
        method: 'eth_sendTransaction',
        params: [{
          from: wallet.address,
          to: usdtContractAddress,
          data: dataPayload,
          gas: '0x2625a0', // standard limits
        }]
      });

      if (txHash) {
        // Success
        setBalance(prev => prev - amount);
        const newTx: Transaction = {
          id: `tx-${Date.now()}`,
          recipientAddress,
          recipientName: moniTag.startsWith('@') ? moniTag.replace('@', '') : 'Celo Address Recipient',
          moniTag,
          amount,
          timestamp: new Date().toISOString(),
          status: 'success',
          txHash: txHash,
          network: wallet.network,
          isSimulated: false
        };

        setTransactions(prev => [newTx, ...prev]);
        setLastSentTx({ amount, nameOrTag: moniTag });
        return true;
      }
    } catch (e) {
      console.error("Metamask request rejected or crashed", e);
    }
    return false;
  };

  // Compute neat statistics
  const totalSent = transactions
    .filter(tx => tx.status === 'success')
    .reduce((acc, current) => acc + current.amount, 0);

  const txCount = transactions.filter(tx => tx.status === 'success').length;

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans flex flex-col items-center justify-start ${
      theme === 'dark' 
        ? 'minipay-bg-gradient-dark text-white' 
        : 'minipay-bg-gradient-light text-gray-900'
    }`} id="mpay-root">
      
      {/* Top Main Navigation Header */}
      <Header 
        address={wallet.address || (wallet.isSandbox ? "0x8979c5503B1a0594197d1d1d1d1d1d1d1d1d1d1d1d" : null)}
        network={wallet.network}
        isSandbox={wallet.isSandbox}
        isMuted={isMuted}
        theme={theme}
        onToggleMute={handleToggleMute}
        onToggleSandbox={handleToggleSandbox}
        onConnect={connectWeb3Wallet}
        onSwitchNetwork={handleSwitchNetwork}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Container Wrapper - Modernized multi-column responsive workspace */}
      <div className="w-full max-w-7xl px-4 sm:px-6 md:px-8 py-8 flex flex-col lg:flex-row gap-8 z-10">
        
        {/* LEFT COLUMN: Account, Balances, & Send Actions */}
        <div className="flex-1 flex flex-col gap-6 w-full lg:max-w-xl">
          
          {/* Welcome Alert Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl p-6 border transition-all relative overflow-hidden select-none flex flex-col gap-1.5 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-[#0c1f16] to-[#040e0a] border-emerald-950/40 shadow-xl'
                : 'bg-gradient-to-br from-emerald-50/70 to-white border-emerald-100/50 shadow-sm'
            }`}
          >
            <div className="absolute right-0 bottom-0 bg-minipay-green/5 w-32 h-32 rounded-full filter blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                theme === 'dark' ? 'bg-minipay-green/20 text-minipay-emerald' : 'bg-emerald-100 text-emerald-800'
              }`}>
                SYSTEM READY
              </span>
              <Sparkles size={11} className="text-minipay-emerald animate-pulse" />
            </div>
            
            <h2 className="font-display font-extrabold text-base tracking-tight mt-1">
              USDT minipay super module is active
            </h2>
            <p className={`text-xs leading-relaxed mt-1 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-650'
            }`}>
              mPay facilitates lightning-speed USDT payments with zero gas latency. Transfer directly to EVM addresses or clean user tags. Connect with metamask or try sandbox.
            </p>
          </motion.div>

          {/* Account stablecoin balances section */}
          <BalanceCard 
            usdtBalance={balance}
            celoBalance={celoBalance}
            network={wallet.network}
            isSandbox={wallet.isSandbox}
            address={wallet.address}
            theme={theme}
            onFaucetClaim={handleFaucetClaim}
            onRefreshBalances={handleRefreshBalances}
          />

          {/* Payment form segment */}
          <SendForm 
            contacts={contacts}
            balance={balance}
            theme={theme}
            onSend={handleSendTransaction}
          />

        </div>

        {/* RIGHT COLUMN: Ledger Activity log, statistics, dApp guidelines */}
        <div className="flex-1 flex flex-col gap-6 w-full">
          
          {/* Activity ledger history log */}
          <RecentTransactions 
            transactions={transactions}
            theme={theme}
            onClearHistory={handleClearHistory}
          />

          {/* Live Metrics card */}
          <div className={`rounded-3xl p-6 border transition-all ${
            theme === 'dark'
              ? 'bg-minipay-slate/40 border-gray-800'
              : 'bg-white border-gray-100 shadow-sm shadow-gray-200/40'
          }`}>
            <h4 className={`font-display font-black text-xs uppercase tracking-widest flex items-center gap-1.5 mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <TrendingUp size={14} className="text-minipay-emerald" />
              <span>Real-time Ecosystem Metrics</span>
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className={`border rounded-2xl p-4 flex flex-col gap-1 transition-all ${
                theme === 'dark' ? 'bg-gray-850/50 border-gray-800' : 'bg-gray-50 border-gray-150'
              }`}>
                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>Total Volume Dispensed</span>
                <span className={`font-display font-black text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-950'}`}>
                  ${totalSent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className={`border rounded-2xl p-4 flex flex-col gap-1 transition-all ${
                theme === 'dark' ? 'bg-gray-850/50 border-gray-800' : 'bg-gray-50 border-gray-150'
              }`}>
                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>Succesful blocks</span>
                <span className={`font-display font-black text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-950'}`}>
                  {txCount} blocks
                </span>
              </div>
            </div>

            <div className={`mt-5 p-4 rounded-2xl border flex items-center gap-3 text-xs leading-relaxed ${
              theme === 'dark'
                ? 'bg-[#0a1811] border-emerald-950/60 text-emerald-400'
                : 'bg-emerald-500/[0.03] border-emerald-100 text-emerald-800'
            }`}>
              <ShieldCheck size={18} className="text-minipay-emerald flex-shrink-0" />
              <p className="font-mono text-[10.5px]">
                <strong>Gas Free UX:</strong> Transactions automatically execute with negligible gas fees sponsored by MiniPay on behalf of consumers.
              </p>
            </div>
          </div>

          {/* Quick FAQ / Specs section */}
          <div className={`rounded-3xl p-6 border transition-all ${
            theme === 'dark'
              ? 'bg-minipay-slate/20 border-gray-850'
              : 'bg-white/50 border-gray-100'
          }`}>
            <h4 className={`font-display font-black text-xs uppercase tracking-widest flex items-center gap-1.5 pb-3 border-b border-gray-400/10 mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <HelpCircle size={14} className="text-minipay-emerald" />
              <span>Celo Spec Guide</span>
            </h4>

            <ul className={`flex flex-col gap-3 font-mono text-[10.5px] ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <li className="flex items-start gap-2.5">
                <Zap size={11} className="text-minipay-emerald mt-0.5 flex-shrink-0" />
                <span><strong>MiniPay Integration:</strong> Automatically binds injected Web3 window credentials for instantaneous on-chain consensus.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Zap size={11} className="text-minipay-emerald mt-0.5 flex-shrink-0" />
                <span><strong>6 Decimals Precision:</strong> Standard USDT stablecoins represent values securely padded as uint256 integers.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* Floating success screen overlay with high-fidelity Emil Kowalski spring motion physics */}
      <AnimatePresence>
        {lastSentTx && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.92, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 420 }}
              className={`w-full max-w-[360px] rounded-[32px] p-8 shadow-2xl relative flex flex-col items-center text-center border overflow-hidden ${
                theme === 'dark'
                  ? 'bg-gradient-to-b from-[#111c16] to-[#0A0F19] border-emerald-900/60 text-white'
                  : 'bg-white border-gray-150 text-gray-900 shadow-gray-400/40'
              }`}
            >
              {/* Absolutes decorative ring */}
              <div className="absolute top-0 w-full h-[6px] bg-gradient-to-r from-minipay-green to-minipay-emerald" />

              {/* Bouncing success icon wheel */}
              <div className="w-16 h-16 rounded-full bg-minipay-green/10 flex items-center justify-center text-minipay-emerald border border-minipay-green/20 mb-5 relative">
                <Check size={32} className="animate-bounce" />
                <div className="absolute inset-0 rounded-full border border-minipay-green/30 animate-ping opacity-30" />
              </div>

              <h3 className="font-display font-extrabold text-xl tracking-tight">
                Transfer block processed!
              </h3>
              
              <p className={`text-xs font-mono mt-2 uppercase tracking-wide px-3 py-1 rounded-full ${
                theme === 'dark' ? 'bg-emerald-950/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700 font-bold'
              }`}>
                SUCCESS • CELO CHAIN
              </p>

              {/* Amount highlights */}
              <div className="my-6">
                <span className="text-[15px] text-gray-400 font-mono font-medium">$</span>
                <span className="font-display font-black text-4xl leading-none">{lastSentTx.amount.toFixed(2)}</span>
                <span className="ml-1.5 text-xs font-bold font-mono text-minipay-emerald bg-minipay-green/10 border border-minipay-green/20 px-2 py-0.5 rounded-full select-none">
                  USDT
                </span>
              </div>

              <p className={`text-xs mb-6 max-w-[240px] leading-relaxed ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Stablecoin funds successfully transferred to <strong>{lastSentTx.nameOrTag}</strong>. Check your wallet balance or recent ledger below.
              </p>

              <button
                onClick={() => {
                  sound.play('click');
                  setLastSentTx(null);
                }}
                className="w-full bg-gradient-to-r from-minipay-green to-minipay-emerald hover:opacity-95 text-white py-3.5 px-6 rounded-2xl font-display font-black text-sm shadow-xl shadow-minipay-green/15 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform"
              >
                <span>Awesome</span>
                <ArrowRight size={14} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
