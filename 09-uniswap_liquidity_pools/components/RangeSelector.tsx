export const RangeSelector = ({
  draftPct,
  setDraftPct,
  applyConcentrated,
  isDraftPctValid,
  useFullRange,
}: {
  draftPct: number;
  setDraftPct: (value: number) => void;
  applyConcentrated: () => void;
  isDraftPctValid: boolean;
  useFullRange: () => void;
}) => {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="w-full bg-white/15 h-12 rounded-md border border-white/5 flex items-center justify-between px-4 flex-1 min-w-55">
        <input
          type="number"
          step="any"
          value={draftPct}
          onChange={(e) => setDraftPct(Number(e.target.value))}
          placeholder="Choose concentrated liquidity percentage"
          className="w-full h-full bg-transparent border-none outline-none text-white text-sm"
        />
        <p className="text-white text-sm font-semibold">%</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={applyConcentrated}
          disabled={!isDraftPctValid}
          className={`w-36 h-12 rounded-md text-sm font-semibold outline-none transition ${
            isDraftPctValid
              ? "bg-blue-600 hover:bg-blue-500"
              : "bg-blue-600/30 cursor-not-allowed"
          }`}
        >
          Apply Concentrated
        </button>
        <button
          onClick={useFullRange}
          className="bg-gray-500/70 w-32 h-12 rounded-md text-sm font-semibold outline-none hover:bg-gray-500/90 transition"
        >
          Full Range
        </button>
      </div>
    </div>
  );
};
