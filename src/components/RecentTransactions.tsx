import React, { useState } from 'react';
import { Transaction } from '../types';
import { Search, ExternalLink, History, ArrowUpRight, X, Trash2, Shield, Calendar, Clock, DollarSign, Wallet } from 'lucide-react';
import { sound } from '../utils/sounds';
import { AnimatePresence, motion } from 'motion/react';

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

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 6)}`;
  };

  const handleTxClick = (tx: Transaction) => {
    sound.play('confirm');
    setSelectedTx(tx);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    sound.play('keypress');
    setSearch(e.target.value);
  };

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
    <div className={`w-full rounded-3xl p-6 shadow-xl transition-all border ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-minipay-slate to-slate-900 border-gray-800 shadow-black/30'
        : 'bg-white border-gray-100 shadow-gray-200/50'
    }`} id="mpay-recent-txs">
      
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-display font-black text-sm tracking-wide uppercase flex items-center gap-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-950'
        }`}>
          <History size={15} className="text-minipay-emerald" />
          <span>Activity Log</span>
        </h3>

        {transactions.length > 0 && (
          <button
            onClick={() => {
              sound.play('error');
              onClearHistory();
            }}
            className={`text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              theme === 'dark' ? 'text-gray-500 hover:text-rose-400' : 'text-gray-400 hover:text-rose-600'
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
            className={`w-full rounded-xl py-2.5 px-3.5 pl-9 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-minipay-green transition-all ${
              theme === 'dark'
                ? 'bg-gray-850 border-gray-800 text-white placeholder-gray-600'
                : 'bg-gray-50 border-gray-150 text-gray-900 placeholder-gray-400 focus:bg-white'
            }`}
          />
          <Search size={13} className="absolute left-3 text-gray-400" />
        </div>
      )}

      {/* Transactions list */}
      <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto hide-scrollbar pt-0.5">
        {filteredTxs.length === 0 ? (
          <div className={`text-center py-8 rounded-2xl flex flex-col items-center justify-center gap-2 border border-dashed ${
            theme === 'dark' ? 'bg-gray-850/50 border-gray-800' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="w-8 h-8 rounded-full bg-slate-500/10 flex items-center justify-center text-slate-400 font-mono text-sm font-black">
              Ø
            </div>
            <p className="text-[10px] font-mono font-black text-gray-400 uppercase tracking-wider">
              No recent logs found
            </p>
            <p className="text-[10px] text-gray-450 font-sans max-w-[200px] leading-snug">
              USDT micro-transfers started above will propagate automatically.
            </p>
          </div>
        ) : (
          filteredTxs.map((tx) => {
            const isSuccess = tx.status === 'success';
            const isFailed = tx.status === 'failed';

            return (
              <div
                key={tx.id}
                onClick={() => handleTxClick(tx)}
                className={`w-full text-left rounded-2xl p-3 flex items-center justify-between transition-all border cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-gray-850/60 border-gray-800/40 hover:bg-gray-850 hover:border-gray-800'
                    : 'bg-gray-50 border-gray-50 hover:bg-gray-100 hover:border-gray-200'
                }`}
              >
                {/* Profile */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    theme === 'dark' 
                      ? isSuccess ? 'bg-emerald-950/40 border-emerald-900 text-emerald-400' : 'bg-rose-950/40 border-rose-900 text-rose-400'
                      : isSuccess ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
                  }`}>
                    <ArrowUpRight size={14} />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className={`text-xs font-black truncate leading-tight ${
                      theme === 'dark' ? 'text-white' : 'text-gray-950'
                    }`}>
                      {tx.recipientName}
                    </span>
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-gray-400 mt-1 select-none">
                      <span>{tx.moniTag}</span>
                      <span>•</span>
                      <span>{tx.timestamp.split('T')[1]?.substring(0, 5) || tx.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex flex-col items-end flex-shrink-0 text-right">
                  <span className={`font-display font-extrabold text-xs mb-0.5 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-950'
                  }`}>
                    -${tx.amount.toFixed(2)} USDT
                  </span>
                  
                  <span className={`text-[8px] font-mono leading-none flex items-center gap-0.5 px-1.5 py-0.5 rounded border ${
                    isSuccess 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-minipay-emerald' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}>
                    {tx.isSimulated && <Shield size={8} />}
                    <span>{tx.status}</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modern Pop-up Receipt detail modal screen */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`w-full max-w-[340px] rounded-3xl p-6 shadow-2xl relative flex flex-col gap-4 border ${
                theme === 'dark'
                  ? 'bg-minipay-slate border-gray-800 text-white shadow-black/80'
                  : 'bg-white border-gray-150 text-gray-900 shadow-gray-400/30'
              }`}
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  sound.play('click');
                  setSelectedTx(null);
                }}
                className={`absolute right-4 top-4 w-7 h-7 rounded-full border flex items-center justify-center cursor-pointer transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-gray-305 hover:bg-gray-700 hover:text-white'
                    : 'bg-gray-55 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <X size={12} />
              </button>

              {/* Receipt Emblem header */}
              <div className="flex flex-col items-center gap-1.5 text-center mt-3 select-none">
                <div className="w-12 h-12 rounded-full bg-minipay-green/10 flex items-center justify-center text-minipay-emerald border border-minipay-green/20">
                  <ArrowUpRight size={22} />
                </div>
                <h4 className="font-display font-extrabold text-base">USDT Payment Receipt</h4>
                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest leading-none">{selectedTx.network} network</p>
              </div>

              {/* Clean breakdown list */}
              <div className={`rounded-2xl p-4 border flex flex-col gap-3 text-xs font-mono ${
                theme === 'dark' ? 'bg-gray-850/60 border-gray-800/80' : 'bg-gray-50 border-gray-100'
              }`}>
                <div className="flex justify-between items-center pb-2 border-b border-gray-400/10">
                  <span className="text-gray-400">Recipient:</span>
                  <span className="font-bold truncate max-w-[170px]">{selectedTx.recipientName} ({selectedTx.moniTag})</span>
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
                    theme === 'dark' ? 'text-gray-350' : 'text-gray-600'
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
                  className="flex-1 bg-minipay-green hover:bg-minipay-green-hover text-white py-2.5 px-4 rounded-xl text-center text-xs font-display font-black flex items-center justify-center gap-1.5 shadow-md shadow-minipay-green/10 transition-transform active:scale-98"
                >
                  <ExternalLink size={12} />
                  <span>Verify on CeloScan</span>
                </a>

                {selectedTx.isSimulated && (
                  <div className={`text-[9px] border rounded-xl px-2.5 py-1 flex items-center gap-1 ${
                    theme === 'dark' ? 'bg-blue-900/10 border-blue-900/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-700'
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
