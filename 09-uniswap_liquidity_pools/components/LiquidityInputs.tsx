import { Pool } from "@uniswap/v3-sdk";

interface LiquidityInputsProps {
  sdkPool: Pool | null;
  depositMode: "token0" | "token1" | "both";
  setDepositMode: (mode: "token0" | "token1" | "both") => void;
  deposit0: string;
  setDeposit0: (value: string) => void;
  deposit1: string;
  setDeposit1: (value: string) => void;
  slippagePct: string;
  setSlippagePct: (value: string) => void;
  isSlippageValid: boolean;
  deadlineMinutes: string;
  setDeadlineMinutes: (value: string) => void;
  isDeadlineValid: boolean;
  deadlineReadable: string | null;
}

export const LiquidityInputs = ({
  sdkPool,
  depositMode,
  setDepositMode,
  deposit0,
  setDeposit0,
  deposit1,
  setDeposit1,
  slippagePct,
  setSlippagePct,
  isSlippageValid,
  deadlineMinutes,
  setDeadlineMinutes,
  isDeadlineValid,
  deadlineReadable,
}: LiquidityInputsProps) => {
  if (!sdkPool) return null;

  return (
    <>
      <div className="border border-white/10 rounded-xl px-4 py-3.5 w-full max-w-2xl bg-gray-900/60 text-white space-y-4 mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-semibold tracking-wide text-gray-300 uppercase">
            Deposit Preview
          </p>
          <div className="flex bg-white/10 rounded-full p-1 text-xs font-semibold">
            <button
              onClick={() => setDepositMode("token0")}
              className={`px-4 py-1 rounded-full transition ${
                depositMode === "token0"
                  ? "bg-blue-500 text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Token0
            </button>
            <button
              onClick={() => setDepositMode("token1")}
              className={`px-4 py-1 rounded-full transition ${
                depositMode === "token1"
                  ? "bg-blue-500 text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Token1
            </button>
            <button
              onClick={() => setDepositMode("both")}
              className={`px-4 py-1 rounded-full transition ${
                depositMode === "both"
                  ? "bg-blue-500 text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Both
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(depositMode === "token0" || depositMode === "both") && (
            <label className="space-y-2 text-sm">
              <span className="text-gray-400">
                {sdkPool.token0.symbol} deposit
              </span>
              <div className="w-full bg-white/15 h-12 rounded-md border border-white/5 flex items-center justify-between px-4">
                <input
                  type="number"
                  step="any"
                  value={deposit0}
                  onChange={(e) => setDeposit0(e.target.value)}
                  placeholder={sdkPool.token0.symbol}
                  className="w-full h-full bg-transparent border-none outline-none text-white text-sm"
                />
                <span className="text-white text-xs font-semibold">
                  {sdkPool.token0.symbol}
                </span>
              </div>
            </label>
          )}

          {(depositMode === "token1" || depositMode === "both") && (
            <label className="space-y-2 text-sm">
              <span className="text-gray-400">
                {sdkPool.token1.symbol} deposit
              </span>
              <div className="w-full bg-white/15 h-12 rounded-md border border-white/5 flex items-center justify-between px-4">
                <input
                  type="number"
                  step="any"
                  value={deposit1}
                  onChange={(e) => setDeposit1(e.target.value)}
                  placeholder={sdkPool.token1.symbol}
                  className="w-full h-full bg-transparent border-none outline-none text-white text-sm"
                />
                <span className="text-white text-xs font-semibold">
                  {sdkPool.token1.symbol}
                </span>
              </div>
            </label>
          )}
        </div>

        <p className="text-xs text-gray-400">
          Enter token amounts to estimate required liquidity per asset.
        </p>
      </div>

      <div className="border border-white/10 rounded-xl px-4 py-4 w-full max-w-2xl bg-gray-900/60 text-white space-y-4 mx-auto">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold tracking-wide text-gray-300 uppercase">
            Transaction Settings
          </p>
          {deadlineReadable && (
            <span className="text-xs font-semibold text-gray-300">
              Expires around {deadlineReadable}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="space-y-2 text-sm">
            <span className="text-gray-400">Slippage tolerance (%)</span>
            <div className="w-full bg-white/15 h-12 rounded-md border border-white/5 flex items-center justify-between px-4">
              <input
                type="number"
                step="0.1"
                min="0"
                value={slippagePct}
                onChange={(event) => setSlippagePct(event.target.value)}
                placeholder="0.5"
                className="w-full h-full bg-transparent border-none outline-none text-white text-sm"
              />
              <span className="text-white text-xs font-semibold">%</span>
            </div>
            {!isSlippageValid && (
              <p className="text-xs text-red-300">
                Enter a value greater than 0 and below 100.
              </p>
            )}
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-gray-400">Deadline (minutes)</span>
            <div className="w-full bg-white/15 h-12 rounded-md border border-white/5 flex items-center justify-between px-4">
              <input
                type="number"
                min="1"
                step="1"
                value={deadlineMinutes}
                onChange={(event) => setDeadlineMinutes(event.target.value)}
                placeholder="20"
                className="w-full h-full bg-transparent border-none outline-none text-white text-sm"
              />
              <span className="text-white text-xs font-semibold">min</span>
            </div>
            {!isDeadlineValid && (
              <p className="text-xs text-red-300">
                Deadline must be a positive number of minutes.
              </p>
            )}
          </label>
        </div>

        <p className="text-xs text-gray-400">
          Slippage tolerance adjusts the minimum token amounts, and the deadline
          controls when the transaction expires.
        </p>
      </div>
    </>
  );
};
