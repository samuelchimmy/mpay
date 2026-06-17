import React, { useState } from 'react';
import { NetworkType } from '../types';
import { RefreshCcw, Coins, PlusCircle, Sparkles, Copy, Check, Shield, ShieldCheck, Wallet, ChevronDown } from 'lucide-react';
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
  celoBalance,
  network,
  isSandbox,
  address,
  theme,
  onFaucetClaim,
  onRefreshBalances,
  onToggleSandbox,
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

  const formatCELO = (val: number) => {
    return val.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
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
    <div className="w-full flex flex-col gap-4" id="mpay-balance">
      
      {/* Wallet Status & Network Switcher Bar (Thick Solid Controls) */}
      <div className={`w-full rounded-2xl p-3 border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        theme === 'dark'
          ? 'bg-slate-900 border-gray-800'
          : 'bg-white border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
      }`}>
        
        {/* Wallet connection status / representation */}
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100 border border-slate-900'
          }`}>
            <Wallet size={14} className={address ? 'text-minipay-green' : 'text-gray-400'} />
          </div>
          
          {address ? (
            <div className="flex flex-col">
              <span className={`text-[10px] font-mono leading-none ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {isSandbox ? "Demo Wallet" : "Web3 Connected"}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`font-mono text-xs font-black select-all ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {formatAddress(address)}
                </span>
                
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className={`p-1 rounded-md transition-all cursor-pointer hover:bg-minipay-green/10 ${
                    theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-650 hover:text-minipay-emerald'
                  }`}
                  title="Copy Celo Address"
                >
                  {copied ? (
                    <Check size={11} className="text-minipay-green animate-bounce" />
                  ) : (
                    <Copy size={11} />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                sound.play('confirm');
                onConnect();
              }}
              className="font-display font-black text-xs text-minipay-emerald flex items-center gap-1 cursor-pointer hover:underline"
            >
              Connect Celo Wallet
            </button>
          )}
        </div>

        {/* Network & Demo Select Button row */}
        <div className="flex items-center gap-2">
          
          {/* Custom Solid Network Swapper */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                sound.play('click');
                setShowNetworkDropdown(!showNetworkDropdown);
              }}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase border-2 transition-all flex items-center gap-1 cursor-pointer ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-750'
                  : 'bg-white border-slate-900 text-slate-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50'
              }`}
            >
              <span>{network}</span>
              <ChevronDown size={11} />
            </button>

            <AnimatePresence>
              {showNetworkDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                  className={`absolute right-0 mt-1 border-2 rounded-xl shadow-xl py-1 z-50 min-w-[140px] font-mono text-xs ${
                    theme === 'dark'
                      ? 'bg-minipay-slate border-gray-750 text-white shadow-black/40'
                      : 'bg-white border-slate-900 text-slate-900 shadow-gray-200/50'
                  }`}
                >
                  <button
                    onClick={() => {
                      sound.play('confirm');
                      onSwitchNetwork('mainnet');
                      setShowNetworkDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between transition-all ${
                      theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
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
                      theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    } ${network === 'testnet' ? 'font-black text-minipay-green bg-minipay-green/5' : ''}`}
                  >
                    <span>Testnet</span>
                    {network === 'testnet' && <div className="w-1.5 h-1.5 rounded-full bg-minipay-green" />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sandbox Toggle Pill */}
          <button
            onClick={() => {
              sound.play('click');
              onToggleSandbox();
            }}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1 border-2 transition-all cursor-pointer ${
              isSandbox
                ? theme === 'dark'
                  ? 'bg-blue-950/40 border-blue-800 text-blue-400'
                  : 'bg-blue-50 border-slate-900 text-blue-800 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                : theme === 'dark'
                  ? 'bg-emerald-950/40 border-emerald-900 text-emerald-400'
                  : 'bg-emerald-50 border-slate-900 text-emerald-800 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            {isSandbox ? <Shield size={10} /> : <ShieldCheck size={10} />}
            <span>{isSandbox ? "Demo" : "Real web3"}</span>
          </button>

        </div>
      </div>

      {/* Primary Balance Display Card (Thick high-contrast borders) */}
      <div className={`relative w-full rounded-3xl p-6 transition-all border-2 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-minipay-slate to-slate-900 border-gray-800 shadow-xl' 
          : 'bg-white border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
      } overflow-hidden`}>
        
        {/* Decorative subtle background blur glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-minipay-green/5 rounded-full filter blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10 w-full animate-fade-in">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100 border border-slate-900'
            }`}>
              <Coins size={14} className="text-minipay-emerald" />
            </div>
            <span className={`font-mono text-xs font-bold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
            }`}>
              USDT Balance
            </span>
          </div>

          <motion.button 
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 450, damping: 20 }}
            onClick={handleRefresh}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-705 text-gray-300 hover:bg-gray-700' 
                : 'bg-gray-50 border-slate-900 text-slate-950 hover:bg-gray-100 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
            } border-2`}
            title="Update balance info"
          >
            <RefreshCcw size={12} className={`${refreshing ? 'animate-spin text-minipay-green' : ''}`} />
          </motion.button>
        </div>

        {/* Dynamic Typography Balance details - NO "Stable" text */}
        <div className="mt-5 flex items-baseline gap-1 relative z-10 select-none">
          <span className={`font-display font-light text-3xl mr-0.5 ${
            theme === 'dark' ? 'text-gray-500' : 'text-slate-400'
          }`}>
            $
          </span>
          <span className={`font-display font-black text-5xl tracking-tight leading-none ${
            theme === 'dark' ? 'text-white' : 'text-slate-950'
          }`}>
            {formatUSDT(usdtBalance).split('.')[0]}
          </span>
          <span className={`font-display font-bold text-2xl ${
            theme === 'dark' ? 'text-gray-400' : 'text-slate-500'
          }`}>
            .{formatUSDT(usdtBalance).split('.')[1]}
          </span>
          <span className="ml-3 font-mono text-[10px] font-black text-white bg-minipay-green border-2 border-slate-900 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            USDT
          </span>
        </div>

        {/* Native Gas display section */}
        <div className={`mt-5 pt-4 border-t-2 border-dashed flex items-center justify-between text-xs font-mono relative z-10 ${
          theme === 'dark' ? 'border-gray-800 text-gray-450' : 'border-slate-900 text-slate-700'
        }`}>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Celo Gas Reserve:</span>
            <span className={`font-black ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>{formatCELO(celoBalance)} CELO</span>
          </div>
          
          {isSandbox && (
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
              theme === 'dark' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-slate-900 text-blue-750'
            }`}>
              Auto Funded
            </span>
          )}
        </div>

      </div>

      {/* Mini Faucet Strip */}
      <div className={`w-full overflow-hidden flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
        theme === 'dark'
          ? 'bg-minipay-slate/40 border-gray-800'
          : 'bg-emerald-500/[0.04] border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
      }`}>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-minipay-green animate-pulse" />
            <span className={`font-display font-black text-xs tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              Sandbox stable faucet
            </span>
          </div>
          <span className={`text-[10px] font-mono leading-tight ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-500 font-medium'
          }`}>
            Get simulated $100.00 instantly to test transfers.
          </span>
        </div>

        <motion.button
          whileHover={{ scale: claiming ? 1.0 : 1.04 }}
          whileTap={{ scale: claiming ? 1.0 : 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          onClick={handleClaim}
          disabled={claiming}
          className={`px-3 py-2 rounded-xl bg-minipay-green text-white font-display font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer border-2 border-slate-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-minipay-green-hover ${
            claiming ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          <PlusCircle size={12} />
          <span>{claiming ? "Topping up..." : "Request $100"}</span>
        </motion.button>
      </div>

    </div>
  );
};
