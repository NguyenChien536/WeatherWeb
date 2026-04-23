/**
 * StatusStates — Loading and Error UI feedback components.
 * LoadingState: Animated spinner with pulsing ring for initial data fetch.
 * ErrorState: Error message display with a retry button.
 *
 * @component LoadingState - No props required
 * @component ErrorState
 * @param {string} props.message - Error message to display
 * @param {Function} props.onRetry - Callback to retry the failed operation
 */
import React from 'react';

export const LoadingState = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full animate-ping" />
      <div className="absolute inset-0 w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
    </div>
    <div className="text-center space-y-2">
      <h2 className="text-xl font-bold text-white">Loading data…</h2>
      <p className="text-slate-400 text-sm">Please wait a moment</p>
    </div>
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6">
    <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-center max-w-md">
      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">⚠️</span>
      </div>
      <h2 className="text-xl font-bold text-white mb-2">An error occurred</h2>
      <p className="text-slate-400 text-sm mb-6">{message}</p>
      <button 
        onClick={onRetry}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20"
      >
        Retry
      </button>
    </div>
  </div>
);
