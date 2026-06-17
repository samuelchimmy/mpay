import React, { useState } from 'react';
import { Transaction } from '../types';
import { Search, History, Trash2, ArrowUpRight, Shield, X, ExternalLink } from 'lucide-react';
import { sound } from '../utils/sounds';
import { motion, AnimatePresence } from 'motion/react';

interface RecentTransactionsProps {
  transactions: Transaction[];
  theme: 'light' | 'dark';
  onClearHistory: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  theme,
  onClearHistory
}) => {
  const [search, setSearch] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    sound.play('keypress');
    setSearch(e.target.value);
  };

  const handleTxClick = (tx: Transaction) => {
    sound.play('confirm');
    setSelectedTx(tx);
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Filter transaction records by tags of input parameters
  const filteredTxs = transactions.filter(tx => {
    const q = search.toLowerCase();
    return (
      tx.recipientName.toLowerCase().includes(q) ||
      tx.moniTag.toLowerCase().includes(q) ||
      tx.recipientAddress.toLowerCase().includes(q) ||
      tx.amount.toString().includes(q) ||
      tx.status.toLowerCase().includes(q)
    );
  });

  const getExplorerLink = (tx: Transaction) => {
    const prefix = tx.network === 'mainnet' ? 'https://celoscan.io' : 'https://alfajores.celoscan.io';
    return `${prefix}/tx/${tx.txHash}`;
  };

  return (
    <div className={`w-full rounded-[24px] p-5 transition-all border-2 ${
      theme === 'dark'
        ? 'bg-[#131A2E] border-white/20'
        : 'bg-white border-slate-900'
    }`} id="mpay-recent-txs">
      
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-display font-black text-xs tracking-wider uppercase flex items-center gap-2 ${
          theme === 'dark' ? 'text-white' : 'text-slate-950'
        }`}>
          <History size={14} className="text-minipay-emerald" />
          <span>Activity Log</span>
        </h3>

        {transactions.length > 0 && (
          <button
            onClick={() => {
              sound.play('error');
              onClearHistory();
            }}
            className={`text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              theme === 'dark' ? 'text-gray-400 hover:text-rose-400' : 'text-slate-500 hover:text-rose-600'
            }`}
          >
            <Trash2 size={12} />
            <span>Reset Ledger</span>
          </button>
        )}
      </div>

      {/* Filter Ledger */}
      {transactions.length > 0 && (
        <div className="relative flex items-center mb-4">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search address or dollar quantity..."
            className={`w-full rounded-xl py-2.5 px-3.5 pl-9 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-minipay-green transition-all border-2 ${
              theme === 'dark'
                ? 'bg-slate-950 border-white/20 text-white placeholder-gray-500'
                : 'bg-white border-slate-900 text-slate-900 placeholder-gray-400 focus:bg-white'
            }`}
          />
          <Search size={13} className="absolute left-3 text-gray-400" />
        </div>
      )}

      {/* Transactions list */}
      <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto hide-scrollbar pt-0.5">
        {filteredTxs.length === 0 ? (
          <div className={`text-center py-8 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-dashed ${
            theme === 'dark' ? 'bg-slate-950/40 border-white/20 text-white/50' : 'bg-gray-50 border-slate-900/20 text-slate-900/50'
          }`}>
            <div className="w-8 h-8 rounded-full bg-slate-500/10 flex items-center justify-center text-slate-450 font-mono text-sm font-black">
              Ø
            </div>
            <p className="text-[10px] font-mono font-black text-gray-400 uppercase tracking-wider">
              No recent logs found
            </p>
            <p className="text-[10px] text-gray-400 font-sans max-w-[200px] leading-snug">
              USDT micro-transfers started above will propagate automatically.
            </p>
          </div>
        ) : (
          filteredTxs.map((tx) => {
            const isSuccess = tx.status === 'success';

            return (
              <motion.div
                key={tx.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 450, damping: 25 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleTxClick(tx)}
                className={`w-full text-left rounded-xl p-3 flex items-center justify-between transition-all border-2 cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-white/20 hover:bg-[#131A2E]'
                    : 'bg-white border-slate-900 hover:bg-gray-50'
                }`}
              >
                {/* Profile */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    theme === 'dark' 
                      ? isSuccess ? 'bg-emerald-950/40 border-white/20 text-emerald-400' : 'bg-rose-950/40 border-white/20 text-rose-450'
                      : isSuccess ? 'bg-emerald-50 border-slate-900 text-emerald-700' : 'bg-rose-50 border-slate-900 text-rose-700'
                  }`}>
                    <ArrowUpRight size={14} />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className={`text-xs font-black truncate leading-tight ${
                      theme === 'dark' ? 'text-white' : 'text-slate-950'
                    }`}>
                      {tx.recipientName.startsWith('0x') ? formatAddress(tx.recipientName) : tx.recipientName}
                    </span>
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-gray-400 mt-1 select-none">
                      <span>{tx.moniTag.startsWith('0x') ? formatAddress(tx.moniTag) : tx.moniTag}</span>
                      <span>•</span>
                      <span>{tx.timestamp.split('T')[1]?.substring(0, 5) || tx.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex flex-col items-end flex-shrink-0 text-right">
                  <span className={`font-display font-extrabold text-xs mb-0.5 ${
                    theme === 'dark' ? 'text-white' : 'text-slate-950'
                  }`}>
                    -${tx.amount.toFixed(2)} USDT
                  </span>
                  
                  <span className={`text-[8px] font-mono leading-none flex items-center gap-0.5 px-1.5 py-0.5 rounded border-2 ${
                    isSuccess 
                      ? 'bg-emerald-500/10 border-minipay-green text-minipay-emerald' 
                      : 'bg-rose-500/10 border-rose-500 text-rose-450'
                  }`}>
                    {tx.isSimulated && <Shield size={8} />}
                    <span>{tx.status}</span>
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Modern Pop-up Receipt detail modal screen */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`w-full max-w-[340px] rounded-3xl p-6 relative flex flex-col gap-4 border-2 ${
                theme === 'dark'
                  ? 'bg-[#131A2E] border-white/20 text-white'
                  : 'bg-white border-slate-900 text-slate-950'
              }`}
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  sound.play('click');
                  setSelectedTx(null);
                }}
                className={`absolute right-4 top-4 w-7 h-7 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-white/20 text-white hover:bg-slate-900'
                    : 'bg-white border-slate-900 text-slate-950 hover:bg-gray-100'
                }`}
              >
                <X size={12} className="stroke-[3px]" />
              </button>

              {/* Receipt Emblem header */}
              <div className="flex flex-col items-center gap-1.5 text-center mt-3 select-none">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-minipay-emerald border-2 ${
                  theme === 'dark' ? 'bg-[#131A2E] border-white/20' : 'bg-emerald-50 border-slate-900'
                }`}>
                  <ArrowUpRight size={22} className="stroke-[3px]" />
                </div>
                <h4 className="font-display font-black text-sm">USDT Payment Receipt</h4>
                <p className={`text-[9px] font-mono uppercase tracking-widest leading-none font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                  {selectedTx.network} network
                </p>
              </div>

              {/* Clean breakdown list */}
              <div className={`rounded-2xl p-4 border-2 flex flex-col gap-3 text-xs font-mono ${
                theme === 'dark' ? 'bg-slate-950 border-white/20' : 'bg-gray-50 border-slate-900/20'
              }`}>
                <div className="flex justify-between items-center pb-2 border-b border-gray-400/10">
                  <span className="text-gray-400">Recipient:</span>
                  <span className="font-bold truncate max-w-[170px]">
                    {selectedTx.recipientName.startsWith('0x') ? formatAddress(selectedTx.recipientName) : selectedTx.recipientName}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-gray-400/10">
                  <span className="text-gray-400">Hex Address:</span>
                  <span className="font-bold underline" title={selectedTx.recipientAddress}>
                    {formatAddress(selectedTx.recipientAddress)}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-gray-400/10">
                  <span className="text-gray-400">Amount Sent:</span>
                  <span className="font-black text-minipay-emerald">${selectedTx.amount.toFixed(2)} USDT</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-gray-400/10">
                  <span className="text-gray-400">Transfer Status:</span>
                  <span className="font-black text-minipay-emerald uppercase tracking-wider">{selectedTx.status}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-gray-400">Transaction Hash:</span>
                  <span className={`font-mono text-[9px] break-all leading-tight select-all ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-650'
                  }`}>
                    {selectedTx.txHash}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mb-1">
                <a
                  href={getExplorerLink(selectedTx)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => sound.play('click')}
                  className={`flex-1 bg-minipay-green text-white py-2.5 px-4 rounded-xl text-center text-xs font-display font-black flex items-center justify-center gap-1.5 transition-all border-2 ${
                    theme === 'dark' 
                      ? 'border-white/20 hover:bg-minipay-green-hover' 
                      : 'border-slate-900 hover:bg-minipay-green-hover'
                  }`}
                >
                  <ExternalLink size={12} className="stroke-[3px]" />
                  <span>Verify on CeloScan</span>
                </a>

                {selectedTx.isSimulated && (
                  <div className={`text-[9px] border-2 rounded-xl px-2.5 py-1 flex items-center gap-1 font-mono font-bold ${
                    theme === 'dark' ? 'bg-[#131A2E] border-white/20 text-white' : 'bg-[#EBF5FF] border-slate-900 text-slate-800'
                  }`}>
                    <Shield size={10} />
                    <span>Sandbox</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
