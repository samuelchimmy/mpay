import React from 'react';
import { Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { sound } from '../utils/sounds';
import { motion } from 'motion/react';

export interface HeaderProps {
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isMuted,
  onToggleMute
}) => {
  return (
    <header className="w-full px-5 py-4 border-b-2 flex items-center justify-between transition-all bg-white border-slate-900" id="mpay-header">
      
      {/* Brand logo & title */}
      <div 
        onClick={() => {
          sound.play('confirm');
        }}
        className="flex items-center cursor-pointer select-none"
      >
        <div className="px-2.5 h-9 rounded-xl bg-minipay-green flex items-center justify-center border-2 border-slate-900">
          <span className="font-display font-extrabold text-lg text-white tracking-tight">Mpay</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        
        {/* Sound switch */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 450, damping: 22 }}
          onClick={() => {
            sound.play('click');
            onToggleMute();
          }}
          className="w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer bg-white border-slate-900 hover:bg-gray-100 text-slate-800"
          title={isMuted ? "Unmute system" : "Mute system"}
        >
          {isMuted ? <VolumeX size={14} className="text-gray-400" /> : <Volume2 size={14} className="text-minipay-green" />}
        </motion.button>

      </div>
    </header>
  );
};
