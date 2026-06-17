import React, { useState } from 'react';
import { NetworkType } from '../types';
import { RefreshCcw, Coins, PlusCircle, Sparkles, Copy, Check, ChevronDown } from 'lucide-react';
import { sound } from '../utils/sounds';
import { motion, AnimatePresence } from 'motion/react';

interface BalanceCardProps {
  usdtBalance: number;
  celoBalance: number;
  network: NetworkType;
  isSandbox: boolean;
  address: string | null;
  theme: 'light' | 'dark';
  onFaucetClaim: () => void;
  onRefreshBalances: () => void;
  onToggleSandbox: () => void;
  onSwitchNetwork: (network: NetworkType) => void;
  onConnect: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  usdtBalance,
  network,
  address,
  theme,
  onFaucetClaim,
  onRefreshBalances,
  onSwitchNetwork,
  onConnect
}) => {
  const [claiming, setClaiming] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);

  const formatUSDT = (val: number) => {
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleClaim = () => {
    setClaiming(true);
    sound.play('success'); 
    
    setTimeout(() => {
      onFaucetClaim();
      setClaiming(false);
    }, 450);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    sound.play('click');
    onRefreshBalances();
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const handleCopyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    sound.play('confirm');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="w-full flex flex-col gap-3.5" id="mpay-balance">
      
      {/* Primary Integrated Balance Card (USDT UP, WALLET DOWN, Sleek & Compact) */}
      <div className={`relative w-full rounded-[24px] p-5 transition-all border-2 ${
        theme === 'dark' 
          ? 'bg-slate-950 border-white shadow-[4px_4px_0px_0px_#009A60]' 
          : 'bg-white border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
      } overflow-hidden`}>
        
        {/* Decorative subtle ambient color flare */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-minipay-green/5 rounded-full filter blur-xl pointer-events-none" />

        {/* --- SECTION 1: USDT BALANCE (UP) --- */}
        <div className="flex items-center justify-between relative z-10 w-full animate-fade-in">
          <div className="flex items-center gap-1.5">
            <Coins size={13} className="text-minipay-emerald" />
            <span className={`font-mono text-[10px] font-black uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              USDT Balance
            </span>
          </div>

          <motion.button 
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 450, damping: 20 }}
            onClick={handleRefresh}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              theme === 'dark' 
                ? 'bg-gray-900 border-white text-white hover:bg-slate-800' 
                : 'bg-gray-50 border-slate-900 text-slate-950 hover:bg-gray-100 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
            } border-2`}
            title="Update balance info"
          >
            <RefreshCcw size={11} className={`${refreshing ? 'animate-spin text-minipay-green' : ''}`} />
          </motion.button>
        </div>

        {/* Dynamic Compact Typography Balance */}
        <div className="mt-2.5 flex items-baseline gap-0.5 relative z-10 select-none">
          <span className={`font-display font-light text-2xl mr-0.5 ${
            theme === 'dark' ? 'text-gray-400' : 'text-slate-400'
          }`}>
            $
          </span>
          <span className={`font-display font-black text-3xl tracking-tight leading-none ${
            theme === 'dark' ? 'text-white' : 'text-slate-950'
          }`}>
            {formatUSDT(usdtBalance).split('.')[0]}
          </span>
          <span className={`font-display font-extrabold text-xl ${
            theme === 'dark' ? 'text-gray-300' : 'text-slate-500'
          }`}>
            .{formatUSDT(usdtBalance).split('.')[1]}
          </span>
          <span className="ml-2.5 font-mono text-[9px] font-black text-white bg-minipay-green border-2 border-slate-900 px-2 py-0.5 rounded-full uppercase tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            USDT
          </span>
        </div>

        {/* Divider separating up and down sections */}
        <div className={`my-4 border-t-2 border-dashed ${
          theme === 'dark' ? 'border-gray-800' : 'border-slate-900'
        }`} />

        {/* --- SECTION 2: CONTROLS & WALLET INFO (DOWN) --- */}
        <div className="flex items-center justify-between gap-3 relative z-10">
          
          {/* Address with copy button only (No Demo titles!) */}
          <div className="flex items-center gap-1.5">
            {address ? (
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 font-mono text-xs font-black ${
                theme === 'dark' 
                  ? 'bg-gray-900 border-white text-white' 
                  : 'bg-white border-slate-900 text-slate-950 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
              }`}>
                <span>{formatAddress(address)}</span>
                
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className={`p-0.5 rounded transition-all cursor-pointer hover:bg-minipay-green/10 ${
                    theme === 'dark' ? 'text-gray-450 hover:text-white' : 'text-slate-600 hover:text-minipay-emerald'
                  }`}
                  title="Copy address"
                >
                  {copied ? (
                    <Check size={11} className="text-minipay-green animate-bounce" />
                  ) : (
                    <Copy size={11} />
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  sound.play('confirm');
                  onConnect();
                }}
                className="font-display font-black text-xs text-minipay-emerald flex items-center gap-1 cursor-pointer hover:underline"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Clean dropdown selector (Testnet/Mainnet) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                sound.play('click');
                setShowNetworkDropdown(!showNetworkDropdown);
              }}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase border-2 transition-all flex items-center gap-1 cursor-pointer ${
                theme === 'dark'
                  ? 'bg-gray-900 border-white text-white hover:bg-gray-800'
                  : 'bg-white border-slate-900 text-slate-950 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50'
              }`}
            >
              <span>{network}</span>
              <ChevronDown size={10} />
            </button>

            <AnimatePresence>
              {showNetworkDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                  className={`absolute right-0 mt-1 border-2 rounded-xl shadow-xl py-1 z-50 min-w-[110px] font-mono text-xs ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-white text-white shadow-black/60'
                      : 'bg-white border-slate-900 text-slate-950 shadow-gray-200/50'
                  }`}
                >
                  <button
                    onClick={() => {
                      sound.play('confirm');
                      onSwitchNetwork('mainnet');
                      setShowNetworkDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between transition-all ${
                      theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
                    } ${network === 'mainnet' ? 'font-black text-minipay-green bg-minipay-green/5' : ''}`}
                  >
                    <span>Mainnet</span>
                    {network === 'mainnet' && <div className="w-1.5 h-1.5 rounded-full bg-minipay-green" />}
                  </button>
                  <button
                    onClick={() => {
                      sound.play('confirm');
                      onSwitchNetwork('testnet');
                      setShowNetworkDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between transition-all ${
                      theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
                    } ${network === 'testnet' ? 'font-black text-minipay-green bg-minipay-green/5' : ''}`}
                  >
                    <span>Testnet</span>
                    {network === 'testnet' && <div className="w-1.5 h-1.5 rounded-full bg-minipay-green" />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* Mini Faucet Strip */}
      <div className={`w-full overflow-hidden flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${
        theme === 'dark'
          ? 'bg-slate-950 border-white shadow-[2px_2px_0px_0px_#009A60]'
          : 'bg-emerald-500/[0.04] border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
      }`}>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <Sparkles size={11} className="text-minipay-green animate-pulse" />
            <span className={`font-display font-black text-xs tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-slate-950'
            }`}>
              Faucet stable top-up
            </span>
          </div>
          <span className={`text-[10px] font-mono leading-tight ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500 font-medium'
          }`}>
            Instantly request simulated $100.00.
          </span>
        </div>

        <motion.button
          whileHover={{ scale: claiming ? 1.0 : 1.04 }}
          whileTap={{ scale: claiming ? 1.0 : 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          onClick={handleClaim}
          disabled={claiming}
          className={`px-3 py-1.5 rounded-xl bg-minipay-green text-white font-display font-black text-[11px] flex items-center gap-1 shadow-md transition-all cursor-pointer border-2 border-slate-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-minipay-green-hover ${
            claiming ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          <PlusCircle size={11} />
          <span>{claiming ? "Topping..." : "Request $100"}</span>
        </motion.button>
      </div>

    </div>
  );
};
