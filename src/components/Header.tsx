import React from 'react';
import { Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { sound } from '../utils/sounds';
import { motion } from 'motion/react';

interface HeaderProps {
  isMuted: boolean;
  theme: 'light' | 'dark';
  onToggleMute: () => void;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isMuted,
  theme,
  onToggleMute,
  onToggleTheme
}) => {
  return (
    <header className={`w-full px-5 py-4 border-b-2 flex items-center justify-between transition-all ${
      theme === 'dark' 
        ? 'bg-[#0B0F19] border-white' 
        : 'bg-white border-slate-900'
    }`} id="mpay-header">
      
      {/* Brand logo & title */}
      <div 
        onClick={() => {
          sound.play('confirm');
        }}
        className="flex items-center gap-2.5 cursor-pointer select-none"
      >
        <div className={`w-9 h-9 rounded-xl bg-minipay-green flex items-center justify-center border-2 ${
          theme === 'dark' ? 'border-white' : 'border-slate-900'
        }`}>
          <span className="font-display font-extrabold text-lg text-white">m</span>
        </div>
        <span className={`font-display font-black text-xl tracking-tight leading-none ${
          theme === 'dark' ? 'text-white' : 'text-slate-950'
        }`}>
          mPay
        </span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        
        {/* Light/Dark mode switcher */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 450, damping: 22 }}
          onClick={() => {
            sound.play('click');
            onToggleTheme();
          }}
          className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${
            theme === 'dark' 
              ? 'bg-[#131A2E] border-white hover:bg-slate-800 text-yellow-400' 
              : 'bg-white border-slate-900 hover:bg-gray-100 text-slate-800'
          }`}
          title="Toggle color theme"
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </motion.button>

        {/* Sound switch */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 450, damping: 22 }}
          onClick={() => {
            sound.play('click');
            onToggleMute();
          }}
          className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${
            theme === 'dark' 
              ? 'bg-[#131A2E] border-white hover:bg-slate-800 text-gray-300' 
              : 'bg-white border-slate-900 hover:bg-gray-100 text-slate-800'
          }`}
          title={isMuted ? "Unmute system" : "Mute system"}
        >
          {isMuted ? <VolumeX size={14} className="text-gray-400" /> : <Volume2 size={14} className="text-minipay-green" />}
        </motion.button>

      </div>
    </header>
  );
};
