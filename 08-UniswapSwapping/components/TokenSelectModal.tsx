"use client";

import { SwapToken } from "@/lib/tokens";
import { useEffect, useState } from "react";

interface TokenSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectToken: (token: SwapToken) => void;
  tokens: SwapToken[];
  isLoading?: boolean;
  error?: string | null;
}

export default function TokenSelectModal({
  isOpen,
  onClose,
  onSelectToken,
  tokens,
  isLoading = false,
  error,
}: TokenSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const normalizedTerm = searchTerm.trim().toLowerCase();
  const filteredTokens = tokens.filter((token) => {
    if (!normalizedTerm) return true;
    const symbol = token.symbol?.toLowerCase() || "";
    const name = token.name?.toLowerCase() || "";
    const address = token.address.toLowerCase();
    return (
      symbol.includes(normalizedTerm) ||
      name.includes(normalizedTerm) ||
      address.includes(normalizedTerm)
    );
  });

  const handleSelect = (token: SwapToken) => {
    onSelectToken(token);
    onClose();
    setSearchTerm("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-105 max-h-[80vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Select a token
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <input
          type="text"
          placeholder="Search name or paste address"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 mb-4"
        />

        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              Loading tokens...
            </div>
          ) : error ? (
            <div className="text-sm text-red-500 text-center py-8">{error}</div>
          ) : filteredTokens.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No tokens found.
            </div>
          ) : (
            filteredTokens.map((token) => (
              <button
                key={token.address}
                onClick={() => handleSelect(token)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-colors"
              >
                {token.logoURI ? (
                  <img
                    src={token.logoURI}
                    alt={token.symbol}
                    className="w-9 h-9 rounded-full"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">
                    {(token.symbol || "").charAt(0) || "?"}
                  </div>
                )}
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {token.symbol || "Unknown"}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {token.name || token.address}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
