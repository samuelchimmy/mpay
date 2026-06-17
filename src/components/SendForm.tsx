import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { Send, DollarSign, Wallet, Check, Zap } from 'lucide-react';
import { sound } from '../utils/sounds';

interface SendFormProps {
  balance: number;
  theme: 'light' | 'dark';
  onSend: (address: string, amount: number, moniTag: string) => Promise<boolean>;
}

export const SendForm: React.FC<SendFormProps> = ({ balance, theme, onSend }) => {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  
  // Slide to Send dimensions
  const sliderWidth = 260; 
  const handleWidth = 48;  
  const dragLimit = sliderWidth - handleWidth;
  const [isSlideDone, setIsSlideDone] = useState(false);
  const x = useMotionValue(0);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    sound.play('keypress');
    setAddress(e.target.value);
    setError(null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    sound.play('keypress');
    const val = e.target.value;
    if (/^\d*\.?\d*$/.test(val)) {
      setAmount(val);
      setError(null);
    }
  };

  const triggerPreset = (presetVal: number) => {
    sound.play('click');
    setAmount(presetVal.toString());
    setError(null);
  };

  const triggerMax = () => {
    sound.play('click');
    if (balance <= 0) {
      setError("Your USDT Balance is empty");
      return;
    }
    setAmount(balance.toFixed(2));
    setError(null);
  };

  const handleDrag = (event: any, info: any) => {
    if (info.point.x >= dragLimit - 5 && !isSlideDone) {
      sound.play('woosh');
      setIsSlideDone(true);
      submitTransfer();
    }
  };

  const submitTransfer = async () => {
    const parsedAmount = parseFloat(amount);
    
    if (!address.trim()) {
      setError("Designate a destination wallet address (0x...)");
      resetSlider();
      sound.play('error');
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Specify clean transfer amount (> $0.00)");
      resetSlider();
      sound.play('error');
      return;
    }

    if (parsedAmount > balance) {
      setError(`Insufficient USDT balance (${balance.toFixed(2)} available)`);
      resetSlider();
      sound.play('error');
      return;
    }

    const destinationAddress = address.trim();
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!ethAddressRegex.test(destinationAddress)) {
      setError("Invalid Celo EVM wallet standard representation (Must start with 0x and be 40 characters)");
      resetSlider();
      sound.play('error');
      return;
    }

    setIsSending(true);
    sound.play('confirm');

    try {
      const ok = await onSend(destinationAddress, parsedAmount, destinationAddress);
      if (ok) {
        sound.play('success');
        setAddress('');
        setAmount('');
        setError(null);
        setSuccessMsg(`Sent $${parsedAmount.toFixed(2)} USDT safely!`);
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        setError("On-chain transaction signature was rejected or failed.");
        sound.play('error');
      }
    } catch (e) {
      setError("Simulated on-chain request runtime failure.");
      sound.play('error');
    } finally {
      setIsSending(false);
      resetSlider();
    }
  };

  const resetSlider = () => {
    setIsSlideDone(false);
    x.set(0);
  };

  const simulateQRScanner = () => {
    sound.play('woosh');
    const mockScan = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
    setAddress(mockScan);
    setError(null);
    setSuccessMsg("Pasted live address from smartphone pasteboard!");
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className={`w-full rounded-[24px] p-5 transition-all border-2 ${
      theme === 'dark'
        ? 'bg-[#131A2E] border-white/20'
        : 'bg-white border-slate-900'
    }`} id="mpay-send-form">
      
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-display font-black text-xs tracking-wider uppercase flex items-center gap-2 ${
          theme === 'dark' ? 'text-white' : 'text-slate-950'
        }`}>
          <Send size={14} className="text-minipay-emerald" />
          <span>Transfer USDT</span>
        </h3>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 450, damping: 20 }}
          onClick={simulateQRScanner}
          className={`flex items-center gap-1.5 text-[10px] font-mono font-bold px-3 py-1.5 rounded-xl border-2 transition-all cursor-pointer ${
            theme === 'dark'
              ? 'bg-slate-950 border-white/20 text-white hover:bg-slate-800'
              : 'bg-white border-slate-900 text-slate-900 hover:bg-gray-50'
          }`}
          title="Paste Address"
        >
          <Zap size={10} />
          <span>Quick Paste</span>
        </motion.button>
      </div>

      {/* Recipient Input (MoniTag or address) */}
      <div className="flex flex-col gap-1.5 mb-4">
        <label className={`text-[10px] font-mono text-xs font-semibold tracking-wide flex items-center gap-1.5 ${
          theme === 'dark' ? 'text-gray-400' : 'text-slate-700 font-bold'
        }`}>
          <Wallet size={11} />
          <span>Recipient Celo Address (0x...)</span>
        </label>
        
        <div className="relative flex items-center">
          <input
            type="text"
            value={address}
            onChange={handleAddressChange}
            placeholder="0x9965503B1a059..."
            className={`w-full border-2 rounded-xl p-3 pr-10 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-minipay-green transition-all ${
              theme === 'dark'
                ? 'bg-slate-950 border-white/20 text-white placeholder-gray-500'
                : 'bg-white border-slate-900 text-slate-900 placeholder-gray-400 focus:bg-white'
            }`}
          />
          <span className="absolute right-3.5 text-gray-400">
            <Wallet size={13} />
          </span>
        </div>
      </div>

      {/* Amount (USDT) - NO "Stable" word */}
      <div className="flex flex-col gap-1.5 mb-5">
        <label className={`text-[10px] font-mono text-xs font-semibold tracking-wide flex items-center gap-1.5 ${
          theme === 'dark' ? 'text-gray-400' : 'text-slate-700 font-bold'
        }`}>
          <DollarSign size={11} />
          <span>USDT Amount</span>
        </label>
        
        <div className="relative flex items-center">
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            className={`w-full border-2 rounded-xl p-3 pl-8 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-minipay-green transition-all ${
              theme === 'dark'
                ? 'bg-slate-950 border-white/20 text-white placeholder-gray-500'
                : 'bg-white border-slate-900 text-slate-900 placeholder-gray-400 focus:bg-white'
            }`}
          />
          <div className="absolute left-3 text-minipay-emerald font-mono font-bold text-xs">$</div>
          <div className="absolute right-3.5 text-[10px] font-bold font-mono text-slate-500">
            USDT
          </div>
        </div>

        {/* Presets and Max switcher controls */}
        <div className="flex gap-1.5 mt-2">
          {[5, 10, 25, 100].map((preset) => (
            <motion.button
              key={preset}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 450, damping: 20 }}
              onClick={() => triggerPreset(preset)}
              className={`flex-1 rounded-xl py-1.5 text-xs font-mono font-medium border-2 transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-950 border-white/20 text-white hover:bg-slate-800'
                  : 'bg-white border-slate-900 text-slate-900 hover:bg-gray-50'
              }`}
            >
              +${preset}
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 450, damping: 20 }}
            onClick={triggerMax}
            className={`flex-1 rounded-xl py-1.5 text-xs font-mono font-black uppercase border-2 transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-minipay-green border-white/20 text-white hover:bg-minipay-green-hover'
                : 'bg-minipay-green text-white border-slate-900 hover:bg-minipay-green-hover'
            }`}
          >
            Max
          </motion.button>
        </div>
      </div>

      {/* Validation status banners */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-450 text-[11px] py-2 px-3 rounded-xl font-mono leading-relaxed"
          >
            ⚠️ {error}
          </motion.div>
        )}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-minipay-emerald text-[11px] py-2 px-3 rounded-xl font-mono leading-relaxed flex items-center gap-1.5"
          >
            <Check size={12} className="text-minipay-emerald animate-bounce" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sliding slide-to-confirm mechanism */}
      <div className="w-full flex justify-center">
        {isSending ? (
          <div className={`w-full rounded-xl p-3 text-center text-xs font-mono font-bold flex items-center justify-center gap-2 border-2 ${
            theme === 'dark'
              ? 'bg-[#131A2E]/80 border-white/20 text-white'
              : 'bg-gray-50 border-slate-900 text-slate-900'
          }`}>
            <span className="w-3.5 h-3.5 rounded-full border-2 border-minipay-green border-t-transparent animate-spin" />
            <span>Broadcasting transaction...</span>
          </div>
        ) : (
          <div 
            className={`w-full max-w-[270px] h-[48px] rounded-xl p-1 relative overflow-hidden select-none flex items-center border-2 transition-all ${
              theme === 'dark'
                ? 'bg-slate-950 border-white/20'
                : 'bg-gray-950 border-slate-900'
            }`}
            id="slide-to-send-container"
          >
            {/* Background label text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pr-3">
              <span className="text-[10px] font-display font-black tracking-widest text-white/70 text-center uppercase animate-pulse select-none">
                Slide to Confirm
              </span>
            </div>

            {/* Shine overlay progress */}
            <motion.div 
              style={{ width: useTransform(x, (v: number) => `${v + 36}px`) }}
              className="absolute inset-y-0 left-0 bg-minipay-green/15 pointer-events-none rounded-l-lg" 
            />

            {/* Draggable Motion Handle */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: dragLimit }}
              dragElastic={0.05}
              dragMomentum={false}
              onDrag={handleDrag}
              style={{ x }}
              whileDrag={{ scale: 1.05 }}
              whileHover={{ cursor: 'grab' }}
              whileTap={{ cursor: 'grabbing' }}
              className={`w-9 h-9 rounded-lg bg-minipay-green flex items-center justify-center text-white cursor-grab z-20 hover:bg-minipay-green-hover active:bg-minipay-emerald transition-all border-2 ${
                theme === 'dark' ? 'border-white/20' : 'border-slate-900'
              }`}
            >
              <Send size={13} />
            </motion.div>
          </div>
        )}
      </div>

    </div>
  );
};
