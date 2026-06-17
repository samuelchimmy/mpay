import React, { useState, useEffect } from 'react';
import { Contact } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Send, DollarSign, Wallet, AtSign, Check, Camera, Contact as ContactIcon, Sparkles } from 'lucide-react';
import { sound } from '../utils/sounds';

interface SendFormProps {
  contacts: Contact[];
  balance: number;
  theme: 'light' | 'dark';
  onSend: (address: string, amount: number, moniTag: string) => Promise<boolean>;
}

export const SendForm: React.FC<SendFormProps> = ({ contacts, balance, theme, onSend }) => {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [suggestedContacts, setSuggestedContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isSending, setIsSending] = useState(false);
  
  // Slide to Send dimensions
  const sliderWidth = 260; 
  const handleWidth = 48;  
  const dragLimit = sliderWidth - handleWidth;
  const [isSlideDone, setIsSlideDone] = useState(false);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    sound.play('keypress');
    const val = e.target.value;
    setAddress(val);
    setSelectedContact(null);
    setError(null);

    if (val.trim() !== '') {
      const query = val.toLowerCase().replace('@', '');
      const filtered = contacts.filter(
        c => c.name.toLowerCase().includes(query) || 
             c.moniTag.toLowerCase().includes(query) || 
             c.address.toLowerCase().includes(query)
      );
      setSuggestedContacts(filtered);
    } else {
      setSuggestedContacts([]);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    sound.play('keypress');
    const val = e.target.value;
    if (/^\d*\.?\d*$/.test(val)) {
      setAmount(val);
      setError(null);
    }
  };

  const selectContact = (contact: Contact) => {
    sound.play('confirm');
    setAddress(contact.moniTag || contact.address);
    setSelectedContact(contact);
    setSuggestedContacts([]);
    setError(null);
  };

  const triggerPreset = (presetVal: number) => {
    sound.play('click');
    setAmount(presetVal.toString());
    setError(null);
  };

  const triggerMax = () => {
    sound.play('click');
    if (balance <= 0) {
      setError("USDT Balance is empty!");
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
      setError("Please designate a target wallet address or @MoniTag");
      resetSlider();
      sound.play('error');
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Specify an amount greater than $0.00");
      resetSlider();
      sound.play('error');
      return;
    }

    if (parsedAmount > balance) {
      setError(`Insufficient funds (Limit: $${balance.toFixed(2)} USDT)`);
      resetSlider();
      sound.play('error');
      return;
    }

    let destinationAddress = address.trim();
    let nameOrTag = address.trim();
    
    if (address.startsWith('@')) {
      const found = contacts.find(c => c.moniTag.toLowerCase() === address.toLowerCase());
      if (found) {
        destinationAddress = found.address;
        nameOrTag = found.moniTag;
      } else {
        // Resolve custom tag
        const randomHex = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
        destinationAddress = randomHex;
      }
    } else {
      const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!ethAddressRegex.test(destinationAddress)) {
        setError("Invalid EVM wallet standard representation (Must start with 0x and be 40 characters)");
        resetSlider();
        sound.play('error');
        return;
      }
    }

    setIsSending(true);
    sound.play('confirm');

    try {
      const ok = await onSend(destinationAddress, parsedAmount, nameOrTag);
      if (ok) {
        sound.play('success');
        setAddress('');
        setAmount('');
        setError(null);
        setSelectedContact(null);
        setSuccessMsg(`Sent $${parsedAmount.toFixed(2)} USDT to ${nameOrTag} successfully!`);
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        setError("Wallet transaction rejected or failed.");
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
  };

  const simulateQRScanner = () => {
    sound.play('woosh');
    const mockScan = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
    setAddress(mockScan);
    setError(null);
    setSuccessMsg("Scanned mock wallet address via simulated smartphone camera!");
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className={`w-full rounded-3xl p-6 shadow-xl transition-all border ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-minipay-slate to-slate-900 border-gray-800 shadow-black/30'
        : 'bg-white border-gray-100 shadow-gray-200/50'
    }`} id="mpay-send-form">
      
      {/* Title */}
      <div className="flex items-center justify-between mb-5">
        <h3 className={`font-display font-black text-sm tracking-wide uppercase flex items-center gap-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-950'
        }`}>
          <Send size={15} className="text-minipay-emerald" />
          <span>Send stable USDT</span>
        </h3>
        
        <button
          onClick={simulateQRScanner}
          className={`flex items-center gap-1.5 text-[10px] font-mono font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          }`}
          title="Scan QR"
        >
          <Camera size={11} />
          <span>Scan Code</span>
        </button>
      </div>

      {/* Quick contacts carousel block - Less cramped space */}
      <div className="flex flex-col gap-2 mb-5">
        <label className={`text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <ContactIcon size={11} />
          <span>Frequent contacts</span>
        </label>
        
        <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar snap-x pt-0.5">
          {contacts.map((contact) => {
            const isChosen = selectedContact?.id === contact.id || address.toLowerCase() === contact.moniTag.toLowerCase();
            return (
              <button
                key={contact.id}
                onClick={() => selectContact(contact)}
                className={`flex-shrink-0 snap-start flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isChosen 
                    ? theme === 'dark'
                      ? 'border-minipay-green bg-minipay-green/10 text-white'
                      : 'border-minipay-green bg-minipay-green/5 text-gray-950 shadow-md shadow-minipay-green/5' 
                    : theme === 'dark'
                      ? 'border-gray-800 bg-gray-850 hover:bg-gray-800 text-gray-300'
                      : 'border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-800 hover:border-gray-200'
                }`}
              >
                <div className={`w-9 h-9 rounded-full ${contact.avatarBg} text-white flex items-center justify-center text-sm shadow-inner`}>
                  {contact.avatarEmoji}
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold leading-tight truncate max-w-[70px]">{contact.name}</p>
                  <p className="text-[8px] font-mono text-gray-400 leading-none mt-0.5">{contact.moniTag}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recipient Input (MoniTag or address) */}
      <div className="flex flex-col gap-2 mb-5 relative">
        <label className={`text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <AtSign size={11} />
          <span>Recipient Wallet Address or MoniTag</span>
        </label>
        
        <div className="relative flex items-center">
          <input
            type="text"
            value={address}
            onChange={handleAddressChange}
            placeholder="0x... or write @tag"
            className={`w-full border rounded-2xl p-4 pr-11 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-minipay-green transition-all ${
              theme === 'dark'
                ? 'bg-gray-850 border-gray-800 text-white placeholder-gray-600'
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white'
            }`}
          />
          <span className="absolute right-4 text-gray-400">
            {address.startsWith('@') ? <AtSign size={14} /> : <Wallet size={14} />}
          </span>
        </div>

        {/* Dynamic drop suggestions container */}
        {suggestedContacts.length > 0 && (
          <div className={`absolute top-[100%] left-0 right-0 border rounded-2xl shadow-2xl mt-1.5 max-h-[180px] overflow-y-auto z-40 py-1.5 ${
            theme === 'dark'
              ? 'bg-minipay-slate border-gray-800 scrollbar-none'
              : 'bg-white border-gray-150 scrollbar-none'
          }`}>
            {suggestedContacts.map((c) => (
              <button
                key={c.id}
                onClick={() => selectContact(c)}
                className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors cursor-pointer border-b last:border-none ${
                  theme === 'dark'
                    ? 'hover:bg-gray-850 border-gray-800/40'
                    : 'hover:bg-gray-50 border-gray-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-full ${c.avatarBg} flex items-center justify-center text-xs text-white`}>
                  {c.avatarEmoji}
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-950'}`}>{c.name}</span>
                  <span className="text-[9px] font-mono text-gray-400 mt-0.5">{c.moniTag} • {c.address.substring(0, 10)}...</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Amount (USDT) */}
      <div className="flex flex-col gap-2 mb-6">
        <label className={`text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <DollarSign size={11} />
          <span>Amount in standard stable USDT</span>
        </label>
        
        <div className="relative flex items-center">
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            className={`w-full border rounded-2xl p-4 pl-9 text-sm font-display font-extrabold focus:outline-none focus:ring-2 focus:ring-minipay-green transition-all ${
              theme === 'dark'
                ? 'bg-gray-850 border-gray-800 text-white placeholder-gray-600'
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white'
            }`}
          />
          <div className="absolute left-4 text-minipay-emerald font-display font-extrabold text-sm">$</div>
          <div className="absolute right-4 text-xs font-bold font-mono text-gray-400">
            USDT
          </div>
        </div>

        {/* Presets and Max switcher controls */}
        <div className="flex gap-2 mt-1">
          {[5, 10, 20, 50].map((preset) => (
            <button
              key={preset}
              onClick={() => triggerPreset(preset)}
              className={`flex-1 rounded-xl py-1.5 text-xs font-mono font-bold border transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-gray-850 border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white'
                  : 'bg-gray-50 border-gray-250 text-gray-700 hover:bg-gray-100'
              }`}
            >
              +${preset}
            </button>
          ))}
          <button
            onClick={triggerMax}
            className={`flex-1 rounded-xl py-1.5 text-xs font-mono font-extrabold uppercase border transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-minipay-green/10 border-minipay-green/35 text-minipay-emerald hover:bg-minipay-green/20'
                : 'bg-minipay-green/5 border-minipay-green/30 text-minipay-emerald hover:bg-minipay-green/10'
            }`}
          >
            Max
          </button>
        </div>
      </div>

      {/* Validation status banners */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs py-3 px-4 rounded-2xl font-mono leading-relaxed"
          >
            ⚠️ {error}
          </motion.div>
        )}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-minipay-emerald text-xs py-3 px-4 rounded-2xl font-mono leading-relaxed flex items-center gap-2"
          >
            <Check size={14} className="text-minipay-emerald animate-bounce" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sliding slide-to-confirm mechanism */}
      <div className="w-full flex justify-center">
        {isSending ? (
          <div className={`w-full rounded-2xl p-4 text-center text-xs font-mono font-bold flex items-center justify-center gap-2.5 border ${
            theme === 'dark'
              ? 'bg-gray-850/80 border-gray-800 text-gray-300'
              : 'bg-gray-50 border-gray-200 text-gray-700'
          }`}>
            <span className="w-4 h-4 rounded-full border-2 border-minipay-green border-t-transparent animate-spin" />
            <span>Mining transfer blocks on Celo...</span>
          </div>
        ) : (
          <div 
            className={`w-full max-w-[270px] h-[52px] rounded-2xl p-1 relative overflow-hidden select-none flex items-center border transition-all ${
              theme === 'dark'
                ? 'bg-slate-900 border-gray-800'
                : 'bg-gray-950 border-gray-950'
            }`}
            id="slide-to-send-container"
          >
            {/* Background label text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pr-3">
              <span className="text-[11px] font-display font-black tracking-widest text-white/70 text-center uppercase animate-pulse select-none">
                Slide to Confirm
              </span>
            </div>

            {/* Shine overlay progress */}
            <div className="absolute inset-y-0 left-0 bg-minipay-green/10 pointer-events-none rounded-l-xl" style={{ right: `${sliderWidth - handleWidth}px` }} />

            {/* Draggable Motion Handle */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: dragLimit }}
              dragElastic={0.05}
              dragMomentum={false}
              onDrag={handleDrag}
              style={{ x: 0 }}
              whileDrag={{ scale: 1.05 }}
              whileHover={{ cursor: 'grab' }}
              whileTap={{ cursor: 'grabbing' }}
              className="w-11 h-11 rounded-xl bg-minipay-green flex items-center justify-center text-white shadow-lg cursor-grab z-20 hover:bg-[#02b362] active:bg-[#029551] transition-colors"
            >
              <Send size={15} />
            </motion.div>
          </div>
        )}
      </div>

    </div>
  );
};
