/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { BalanceCard } from './components/BalanceCard';
import { SendForm } from './components/SendForm';
import { RecentTransactions } from './components/RecentTransactions';
import { Transaction, NetworkType, WalletState } from './types';
import { sound } from './utils/sounds';
import { 
  getInjectedEthereum, 
  getConnectedAddress, 
  connectInjectedWallet, 
  getWalletNetwork, 
  switchOrAddCeloNetwork,
  encodeERC20Transfer,
  getNativeCeloBalance,
  getUsdtBalance,
  getCusdBalance,
  USDT_ADDRESSES,
  CUSD_ADDRESSES
} from './utils/ethereum';
import { ArrowRight, Check, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // --- Core States ---
  // Default values used when wallet is not connected
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('mpay_usdt_balance');
    return saved ? parseFloat(saved) : 0.00;
  });
  
  const [cusdBalance, setCusdBalance] = useState<number>(() => {
    const saved = localStorage.getItem('mpay_cusd_balance');
    return saved ? parseFloat(saved) : 0.00;
  });
  
  const [celoBalance, setCeloBalance] = useState<number>(() => {
    const saved = localStorage.getItem('mpay_celo_balance');
    return saved ? parseFloat(saved) : 0.00;
  });

  const theme = 'light' as 'light' | 'dark';

  // Start with completely empty transaction history - NO pre-seeded mock history items!
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('mpay_transactions');
    try {
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse transactions", e);
    }
    return [];
  });

  const [wallet, setWallet] = useState<WalletState>(() => {
    return {
      address: null,
      network: 'mainnet', // Default to mainnet as requested
      usdtBalance: 0,
      cusdBalance: 0,
      celoBalance: 0,
      isSandbox: false, // Sandbox mode disabled completely
      status: 'disconnected'
    };
  });

  const walletRef = useRef(wallet);
  useEffect(() => {
    walletRef.current = wallet;
  }, [wallet]);

  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('mpay_muted') === 'true';
  });
  
  // Confirmed payment modal
  const [lastSentTx, setLastSentTx] = useState<{ amount: number; nameOrTag: string } | null>(null);

  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // --- Synchronization & Storage ---
  useEffect(() => {
    localStorage.setItem('mpay_usdt_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('mpay_cusd_balance', cusdBalance.toString());
  }, [cusdBalance]);

  useEffect(() => {
    localStorage.setItem('mpay_celo_balance', celoBalance.toString());
  }, [celoBalance]);

  useEffect(() => {
    localStorage.setItem('mpay_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('mpay_muted', isMuted.toString());
  }, [isMuted]);



  // Dynamic balance fetcher from Celo RPC
  const fetchLiveBalances = async (addr: string, net: NetworkType) => {
    try {
      const uBal = await getUsdtBalance(addr, net);
      const cUSDBal = await getCusdBalance(addr, net);
      const cBal = await getNativeCeloBalance(addr, net);
      
      setBalance(uBal);
      setCusdBalance(cUSDBal);
      setCeloBalance(cBal);

      setWallet(prev => ({
        ...prev,
        usdtBalance: uBal,
        cusdBalance: cUSDBal,
        celoBalance: cBal,
        status: 'connected'
      }));
    } catch (e) {
      console.error("Failed to query Celo ERC-20 token contract balances", e);
    }
  };

  // Attempt auto-connecting real wallet if injected
  useEffect(() => {
    const initWeb3Check = async () => {
      const eth = await getInjectedEthereum();
      
      if (eth) {
        const addr = await getConnectedAddress();
        if (addr) {
          const net = await getWalletNetwork();
          setWallet({
            address: addr,
            network: net,
            isSandbox: false,
            status: 'connected',
            usdtBalance: 0,
            cusdBalance: 0,
            celoBalance: 0
          });
          // Load real live connected wallet balances
          await fetchLiveBalances(addr, net);
        } else {
          setWallet({
            address: null,
            network: 'mainnet',
            isSandbox: false,
            status: 'disconnected',
            usdtBalance: 0,
            cusdBalance: 0,
            celoBalance: 0
          });
          setBalance(0.00);
          setCusdBalance(0.00);
          setCeloBalance(0.00);
        }
      } else {
        setWallet({
          address: null,
          network: 'mainnet',
          isSandbox: false,
          status: 'disconnected',
          usdtBalance: 0,
          cusdBalance: 0,
          celoBalance: 0
        });
        setBalance(0.00);
        setCusdBalance(0.00);
        setCeloBalance(0.00);
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

  const handleAccountsChanged = async (accounts: Array<string>) => {
    if (accounts.length > 0) {
      const eth = await getInjectedEthereum();
      const rawNet = eth ? await getWalletNetwork() : 'mainnet' as NetworkType;
      setWallet(prev => ({
        ...prev,
        address: accounts[0],
        status: 'connected',
        network: rawNet,
        isSandbox: false
      }));
      await fetchLiveBalances(accounts[0], rawNet);
      sound.play('confirm');
    } else {
      setWallet({
        address: null,
        network: 'mainnet',
        isSandbox: false,
        status: 'disconnected',
        usdtBalance: 0,
        cusdBalance: 0,
        celoBalance: 0
      });
      setBalance(0.00);
      setCusdBalance(0.00);
      setCeloBalance(0.00);
    }
  };

  const handleChainChanged = async (chainIdHex: string) => {
    const net: NetworkType = (chainIdHex === '0xaef3' || chainIdHex === '44787') ? 'testnet' : 'mainnet';
    setWallet(prev => ({
      ...prev,
      network: net
    }));
    const currentWallet = walletRef.current;
    if (currentWallet.address) {
      await fetchLiveBalances(currentWallet.address, net);
    }
    sound.play('woosh');
  };

  // --- Handlers & Core Functions ---
  const handleToggleMute = () => {
    const nextMute = sound.toggleMute();
    setIsMuted(nextMute);
  };

  const connectWeb3Wallet = async () => {
    setWallet(prev => ({ ...prev, status: 'connecting' }));
    const addr = await connectInjectedWallet();
    if (addr) {
      const net = await getWalletNetwork();
      setWallet({
        address: addr,
        network: net,
        isSandbox: false,
        status: 'connected',
        usdtBalance: 0,
        cusdBalance: 0,
        celoBalance: 0
      });
      await fetchLiveBalances(addr, net);
      sound.play('success');
    } else {
      setWallet({
        address: null,
        network: 'mainnet',
        isSandbox: false,
        status: 'disconnected',
        usdtBalance: 0,
        cusdBalance: 0,
        celoBalance: 0
      });
      setBalance(0.00);
      setCusdBalance(0.00);
      setCeloBalance(0.00);
      sound.play('error');
    }
  };

  const handleSwitchNetwork = async (network: NetworkType) => {
    const ok = await switchOrAddCeloNetwork(network);
    if (ok) {
      setWallet(prev => ({ ...prev, network }));
      if (wallet.address) {
        await fetchLiveBalances(wallet.address, network);
      }
    }
  };

  const handleFaucetClaim = async () => {
    // Open testing stable coin faucet for Alfajores or Mento Swap
    if (wallet.network === 'testnet') {
      window.open("https://faucet.celo.org/alfajores", "_blank");
    } else {
      window.open("https://app.mento.org/", "_blank");
    }
  };

  const handleRefreshBalances = async () => {
    sound.play('click');
    if (wallet.address) {
      await fetchLiveBalances(wallet.address, wallet.network);
    }
  };

  const handleClearHistory = () => {
    setTransactions([]);
  };

  const handleSendTransaction = async (recipientAddress: string, amount: number, moniTag: string): Promise<boolean> => {
    // Real Celo onchain transaction execution
    const eth = await getInjectedEthereum();
    if (!eth || !wallet.address) {
      return false;
    }

    try {
      // Intelligently select token based on current balances (prefer cUSD if USDT balance is zero/insufficient)
      const useCusd = wallet.cusdBalance >= amount && wallet.usdtBalance < amount;
      
      const contractAddress = useCusd
        ? (wallet.network === 'mainnet' ? CUSD_ADDRESSES.mainnet : CUSD_ADDRESSES.testnet)
        : (wallet.network === 'mainnet' ? USDT_ADDRESSES.mainnet : USDT_ADDRESSES.testnet);
        
      const decimals = useCusd
        ? 18
        : (wallet.network === 'mainnet' ? 6 : 18);
        
      const dataPayload = encodeERC20Transfer(recipientAddress, amount, decimals);

      const txHash = await eth.request({
        method: 'eth_sendTransaction',
        params: [{
          from: wallet.address,
          to: contractAddress,
          data: dataPayload,
          gas: '0x2625a0',
        }]
      });

      if (txHash) {
        // Optimistically record the tx locally immediately
        const newTx: Transaction = {
          id: `tx-${Date.now()}`,
          recipientAddress,
          recipientName: recipientAddress,
          moniTag: recipientAddress,
          amount,
          timestamp: new Date().toISOString(),
          status: 'success',
          txHash: txHash,
          network: wallet.network,
          isSimulated: false
        };

        setTransactions(prev => [newTx, ...prev]);
        setLastSentTx({ amount, nameOrTag: recipientAddress });
        
        // Refresh balances after brief dispatch threshold
        setTimeout(() => {
          if (wallet.address) {
            fetchLiveBalances(wallet.address, wallet.network);
          }
        }, 3000);

        return true;
      }
    } catch (e) {
      console.error("User rejected transfer signature request", e);
    }
    return false;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans flex flex-col items-center justify-start pb-12 ${
      theme === 'dark' 
        ? 'minipay-bg-gradient-dark text-white' 
        : 'minipay-bg-gradient-light text-gray-900'
    }`} id="mpay-root">
      
      {/* Top Main Navigation Header */}
      <Header 
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Workspace Layout (Two compact columns focusing entirely on transactions) */}
      <div className="w-full max-w-5xl px-4 sm:px-6 py-6 flex flex-col md:flex-row gap-6 z-10 mt-2">
        
        {/* LEFT COLUMN: Balances & Core Send Action */}
        <div className="flex-1 flex flex-col gap-6 w-full">
          {/* Native/Stable Balance details */}
          <BalanceCard 
            usdtBalance={balance}
            cusdBalance={cusdBalance}
            celoBalance={celoBalance}
            network={wallet.network}
            address={wallet.address}
            theme={theme}
            onFaucetClaim={handleFaucetClaim}
            onRefreshBalances={handleRefreshBalances}
            onSwitchNetwork={handleSwitchNetwork}
            onConnect={connectWeb3Wallet}
          />

          {/* Secure Transfer engine inputs */}
          <SendForm 
            balance={balance + cusdBalance}
            theme={theme}
            onSend={handleSendTransaction}
          />
        </div>

        {/* RIGHT COLUMN: Streamlined clean transaction ledger */}
        <div className="flex-1 flex flex-col gap-6 w-full">
          <RecentTransactions 
            transactions={transactions}
            theme={theme}
            onClearHistory={handleClearHistory}
          />
        </div>

      </div>

      {/* Footer */}
      <div className="w-full max-w-5xl px-4 sm:px-6 mt-4">
        <div className={`w-full border-t-2 mb-4 ${theme === 'dark' ? 'border-white/20' : 'border-slate-900/20'}`} />
        <div className="flex justify-center items-center gap-6 text-[10px] font-mono font-medium pb-4">
          <button onClick={() => setShowTerms(true)} className={`hover:underline transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>Terms</button>
          <button onClick={() => setShowPrivacy(true)} className={`hover:underline transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>Privacy</button>
          <a href="https://github.com/samuelchimmy/mpay" target="_blank" rel="noreferrer" className={`hover:underline flex items-center gap-1 transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
            GitHub <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* High-fidelity Spring confirmation overlay (Success Draw-in Checkmark Modal) */}
      <AnimatePresence>
        {lastSentTx && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 380 }}
              className={`w-full max-w-[340px] rounded-[32px] p-6 relative flex flex-col items-center text-center border-2 overflow-hidden ${
                theme === 'dark'
                  ? 'bg-[#0E1528] border-gray-750 text-white'
                  : 'bg-white border-slate-900 text-slate-950'
              }`}
            >
              {/* Solid top border representing thick styling */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-minipay-green" />

              {/* Draw-in Checkmark Animation */}
              <div className="w-20 h-20 flex items-center justify-center mb-4 mt-2">
                <svg className="w-16 h-16 text-minipay-emerald" viewBox="0 0 52 52">
                  <motion.circle
                    cx="26"
                    cy="26"
                    r="23"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                  <motion.path
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 27l7 7 15-15"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.45, ease: "easeOut" }}
                  />
                </svg>
              </div>

              <h3 className="font-display font-black text-xl tracking-tight">
                Transfer Successful!
              </h3>
              
              <p className={`text-[10px] font-mono mt-2 uppercase tracking-widest px-3 py-1 rounded-full font-bold border-2 ${
                theme === 'dark' 
                  ? 'bg-emerald-950/20 border-emerald-900 text-emerald-400' 
                  : 'bg-emerald-50 border-slate-900 text-emerald-800'
              }`}>
                TRANSACTION CONFIRMED
              </p>

              <div className="my-6">
                <span className="text-sm text-gray-500 font-mono font-bold">$</span>
                <span className="font-display font-black text-4xl tracking-tight leading-none">
                  {lastSentTx.amount.toFixed(2)}
                </span>
                <span className="ml-1.5 text-[10px] font-black font-mono text-white bg-minipay-green border-2 border-slate-900 px-2 py-0.5 rounded-full">
                  USDT
                </span>
              </div>

              <p className={`text-xs mb-6 max-w-[250px] font-medium leading-relaxed ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-650'
              }`}>
                Successfully transfered assets to recipient address: <span className="font-mono block mt-1 font-bold break-all bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg border dark:border-gray-800">{lastSentTx.nameOrTag}</span>
              </p>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  sound.play('confirm');
                  setLastSentTx(null);
                }}
                className="w-full bg-minipay-green text-white py-3.5 px-5 rounded-2xl font-display font-black text-xs border-2 border-slate-900 hover:bg-minipay-green-hover flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Done</span>
                <ArrowRight size={13} className="stroke-[3px]" />
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Terms Modal */}
      <AnimatePresence>
        {showTerms && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`w-full max-w-sm max-h-[80vh] overflow-y-auto rounded-[32px] p-6 relative flex flex-col gap-4 border-2 ${
                theme === 'dark'
                  ? 'bg-[#0B0F19] border-white/20 text-white'
                  : 'bg-white border-slate-900 text-slate-950'
              }`}
            >
              <button
                onClick={() => setShowTerms(false)}
                className={`absolute right-4 top-4 w-7 h-7 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-white/20 text-white hover:bg-slate-900'
                    : 'bg-white border-slate-900 text-slate-950 hover:bg-gray-100'
                }`}
              >
                <X size={12} className="stroke-[3px]" />
              </button>
              <h3 className="font-display font-black text-xl mb-1">Terms of Service</h3>
              <div className={`text-[11px] font-mono space-y-4 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
                <p>By using mPay, you agree to these simulated terms. mPay is a decentralized application simulator designed for the Celo blockchain (Alfajores Testnet / Mainnet).</p>
                <p>1. <strong>Demo Purposes</strong>: The sandbox mode operates entirely on simulated balances and does not involve real-world value. Testnet transactions are executed on Celo Alfajores.</p>
                <p>2. <strong>Wallet Security</strong>: You are entirely responsible for the security of your connected Web3 wallet. The application does not store private keys.</p>
                <p>3. <strong>Liability</strong>: Transactions executed on Mainnet are permanent and irreversible. We do not accept liability for loss of funds resulting from user error or smart contract interactions.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Privacy Modal */}
      <AnimatePresence>
        {showPrivacy && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`w-full max-w-sm max-h-[80vh] overflow-y-auto rounded-[32px] p-6 relative flex flex-col gap-4 border-2 ${
                theme === 'dark'
                  ? 'bg-[#0B0F19] border-white/20 text-white'
                  : 'bg-white border-slate-900 text-slate-950'
              }`}
            >
              <button
                onClick={() => setShowPrivacy(false)}
                className={`absolute right-4 top-4 w-7 h-7 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-white/20 text-white hover:bg-slate-900'
                    : 'bg-white border-slate-900 text-slate-950 hover:bg-gray-100'
                }`}
              >
                <X size={12} className="stroke-[3px]" />
              </button>
              <h3 className="font-display font-black text-xl mb-1">Privacy Policy</h3>
              <div className={`text-[11px] font-mono space-y-4 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
                <p>We respect your privacy as a decentralized application. Your data belongs to you.</p>
                <p>1. <strong>Wallet Connection</strong>: We only collect your public wallet address to interact with the blockchain and check balances. This information is available publicly on the ledger.</p>
                <p>2. <strong>Local Storage</strong>: Transaction history is stored purely locally on your device within your browser's local storage and is never transmitted to tracking servers.</p>
                <p>3. <strong>Tracking</strong>: No persistent user identifiable tracking or telemetry is utilized by mPay.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
