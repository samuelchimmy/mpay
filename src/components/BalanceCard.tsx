import React, { useState } from 'react';
import { NetworkType } from '../types';
import { RefreshCcw, Coins, PlusCircle, Sparkles, TrendingUp, DollarSign } from 'lucide-react';
import { sound } from '../utils/sounds';

interface BalanceCardProps {
  usdtBalance: number;
  celoBalance: number;
  network: NetworkType;
  isSandbox: boolean;
  address: string | null;
  theme: 'light' | 'dark';
  onFaucetClaim: () => void;
  onRefreshBalances: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  usdtBalance,
  celoBalance,
  network,
  isSandbox,
  address,
  theme,
  onFaucetClaim,
  onRefreshBalances
}) => {
  const [claiming, setClaiming] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  return (
    <div className="w-full flex flex-col gap-4" id="mpay-balance">
      
      {/* Primary Balance Display Card */}
      <div className={`relative w-full rounded-3xl p-6 shadow-xl transition-all border ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-minipay-slate to-slate-900 border-gray-800 shadow-black/30' 
          : 'bg-white border-gray-100 shadow-gray-200/50'
      } overflow-hidden`}>
        
        {/* Subtle decorative background blur glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-minipay-green/5 rounded-full filter blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-minipay-green/10 flex items-center justify-center">
              <Coins size={14} className="text-minipay-emerald" />
            </div>
            <span className={`font-mono text-xs font-bold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              USDT Stable Balance
            </span>
          </div>

          <button 
            onClick={handleRefresh}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' 
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            } border`}
            title="Update balance info"
          >
            <RefreshCcw size={13} className={`${refreshing ? 'animate-spin text-minipay-green' : ''}`} />
          </button>
        </div>

        {/* Dynamic Typography Balance details */}
        <div className="mt-4 flex items-baseline gap-1 relative z-10">
          <span className={`font-display font-light text-3xl mr-0.5 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
          }`}>
            $
          </span>
          <span className={`font-display font-black text-5xl tracking-tight leading-none ${
            theme === 'dark' ? 'text-white' : 'text-gray-950'
          }`}>
            {formatUSDT(usdtBalance).split('.')[0]}
          </span>
          <span className={`font-display font-bold text-2xl ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            .{formatUSDT(usdtBalance).split('.')[1]}
          </span>
          <span className="ml-3 font-mono text-[10px] font-black text-minipay-emerald bg-minipay-green/10 border border-minipay-green/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
            USDT
          </span>
        </div>

        {/* Native Gas display section */}
        <div className={`mt-5 pt-4 border-t border-dashed flex items-center justify-between text-xs font-mono relative z-10 ${
          theme === 'dark' ? 'border-gray-800 text-gray-400' : 'border-gray-150 text-gray-500'
        }`}>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Celo Gas Reserve:</span>
            <span className={`font-black ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{formatCELO(celoBalance)} CELO</span>
          </div>
          
          {isSandbox && (
            <span className="text-[9px] bg-blue-500/10 text-blue-400 font-bold px-2 py-0.5 rounded-md border border-blue-500/10">
              Auto Funded
            </span>
          )}
        </div>

      </div>

      {/* Mini Faucet Strip */}
      <div className={`w-full overflow-hidden flex items-center justify-between p-4 rounded-2xl border transition-all ${
        theme === 'dark'
          ? 'bg-minipay-slate/40 border-gray-850 shadow-lg shadow-black/10'
          : 'bg-emerald-500/[0.04] border-emerald-100 shadow-sm shadow-emerald-500/5'
      }`}>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-minipay-emerald animate-pulse" />
            <span className={`font-display font-extrabold text-xs tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Celo Sandbox Stable Faucet
            </span>
          </div>
          <span className={`text-[10px] font-mono mt-1 ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            Get simulated $100.00 instantly to test transfers.
          </span>
        </div>

        <button
          onClick={handleClaim}
          disabled={claiming}
          className={`px-4 py-2 rounded-xl bg-minipay-green hover:bg-minipay-green-hover text-white font-display font-black text-xs flex items-center gap-1.5 shadow-md shadow-minipay-green/10 transition-all cursor-pointer ${
            claiming ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          <PlusCircle size={13} />
          <span>{claiming ? "Topping up..." : "Request $100"}</span>
        </button>
      </div>

    </div>
  );
};
