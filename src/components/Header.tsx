import React, { useState } from 'react';
import { NetworkType } from '../types';
import { Wallet, Volume2, VolumeX, Shield, ShieldCheck, Sun, Moon, Sparkles, ChevronDown } from 'lucide-react';
import { sound } from '../utils/sounds';

interface HeaderProps {
  address: string | null;
  network: NetworkType;
  isSandbox: boolean;
  isMuted: boolean;
  theme: 'light' | 'dark';
  onToggleMute: () => void;
  onToggleSandbox: () => void;
  onConnect: () => void;
  onSwitchNetwork: (network: NetworkType) => void;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  address,
  network,
  isSandbox,
  isMuted,
  theme,
  onToggleMute,
  onToggleSandbox,
  onConnect,
  onSwitchNetwork,
  onToggleTheme
}) => {
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 5)}...${addr.substring(addr.length - 4)}`;
  };

  const handleMuteClick = () => {
    onToggleMute();
  };

  return (
    <header className={`w-full px-5 py-4 border-b flex flex-col gap-3 relative z-50 transition-all ${
      theme === 'dark' 
        ? 'bg-minipay-dark/90 border-gray-800' 
        : 'bg-white/90 border-gray-100'
    }`} id="mpay-header">
      
      {/* Primary Brand & Actions row */}
      <div className="flex items-center justify-between">
        
        {/* Brand logo */}
        <div 
          onClick={() => {
            sound.play('confirm');
          }}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-minipay-green to-minipay-emerald flex items-center justify-center shadow-lg shadow-minipay-green/20">
            <span className="font-display font-extrabold text-xl text-white">m</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className={`font-display font-black text-lg tracking-tight leading-none ${
                theme === 'dark' ? 'text-white' : 'text-gray-950'
              }`}>mPay</span>
              <span className="text-[10px] bg-minipay-green/10 text-minipay-emerald px-1.5 py-0.5 rounded-full font-bold">V2.0</span>
            </div>
            <span className={`text-[9px] font-mono font-bold tracking-widest uppercase mt-1 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`}>Celo Stable micro</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          
          {/* Light/Dark mode switcher */}
          <button
            onClick={() => {
              sound.play('click');
              onToggleTheme();
            }}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-yellow-400' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600'
            }`}
            title="Toggle theme wrapper"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Sound switch */}
          <button
            onClick={handleMuteClick}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600'
            }`}
            title={isMuted ? "Unmute sound" : "Mute sound"}
          >
            {isMuted ? <VolumeX size={15} className="text-gray-400" /> : <Volume2 size={15} className="text-minipay-green" />}
          </button>

          {/* Real Wallet / Sandbox Badge info */}
          {address ? (
            <div 
              onClick={() => {
                sound.play('click');
                setShowNetworkDropdown(!showNetworkDropdown);
              }}
              className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-white'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-800'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isSandbox ? 'bg-blue-500' : 'bg-minipay-green'} animate-pulse`} />
              <span>{formatAddress(address)}</span>
              <ChevronDown size={12} className="opacity-60" />
            </div>
          ) : (
            <button
              onClick={() => {
                sound.play('confirm');
                onConnect();
              }}
              className="px-4 py-1.5 rounded-xl bg-minipay-green hover:bg-minipay-green-hover text-white font-display font-bold text-xs flex items-center gap-1.5 shadow-md shadow-minipay-green/10 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Wallet size={12} />
              Connect
            </button>
          )}

        </div>

      </div>

      {/* Network Select & Sandbox Banner secondary row */}
      <div className="flex items-center justify-between text-xs pt-1">
        
        {/* Network Selector dropdown triggers */}
        <div className="relative">
          <button
            onClick={() => {
              sound.play('click');
              setShowNetworkDropdown(!showNetworkDropdown);
            }}
            className={`flex items-center gap-1 font-mono font-bold uppercase tracking-wider text-[10px] hover:opacity-80 transition-opacity cursor-pointer ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <span>CELO: {network}</span>
            <span className="text-[8px]">▼</span>
          </button>
          
          {showNetworkDropdown && (
            <div className={`absolute left-0 mt-1.5 border rounded-xl shadow-xl py-1 z-50 min-w-[160px] font-mono text-xs ${
              theme === 'dark' 
                ? 'bg-minipay-slate border-gray-700 text-white shadow-black/40' 
                : 'bg-white border-gray-150 text-gray-800 shadow-gray-200/50'
            }`}>
              <button
                onClick={() => {
                  sound.play('confirm');
                  onSwitchNetwork('mainnet');
                  setShowNetworkDropdown(false);
                }}
                className={`w-full text-left px-4 py-2 hover:opacity-90 flex items-center justify-between transition-all ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                } ${network === 'mainnet' ? 'font-black text-minipay-green bg-minipay-green/5' : ''}`}
              >
                <span>Celo Mainnet</span>
                {network === 'mainnet' && <div className="w-1.5 h-1.5 rounded-full bg-minipay-green" />}
              </button>
              <button
                onClick={() => {
                  sound.play('confirm');
                  onSwitchNetwork('testnet');
                  setShowNetworkDropdown(false);
                }}
                className={`w-full text-left px-4 py-2 hover:opacity-90 flex items-center justify-between transition-all ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                } ${network === 'testnet' ? 'font-black text-minipay-green bg-minipay-green/5' : ''}`}
              >
                <span>Alfajores Testnet</span>
                {network === 'testnet' && <div className="w-1.5 h-1.5 rounded-full bg-minipay-green" />}
              </button>
            </div>
          )}
        </div>

        {/* Switch sandbox / real web3 */}
        <button
          onClick={() => {
            sound.play('click');
            onToggleSandbox();
          }}
          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1 border transition-all cursor-pointer ${
            isSandbox 
              ? theme === 'dark'
                ? 'bg-blue-900/20 border-blue-800 text-blue-400' 
                : 'bg-blue-50 border-blue-200 text-blue-700'
              : theme === 'dark'
                ? 'bg-emerald-950/40 border-emerald-900 text-emerald-400' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          {isSandbox ? <Shield size={9} /> : <ShieldCheck size={9} />}
          <span>{isSandbox ? "Demo mode" : "Real web3 injection"}</span>
        </button>

      </div>
    </header>
  );
};
