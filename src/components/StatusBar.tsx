type StatusBarProps = {
  currentPlayer: "X" | "O";
  activeBoard: string;
};

export default function StatusBar({
  currentPlayer,
  activeBoard,
}: StatusBarProps) {
  return (
    <div className="mt-10 flex flex-wrap justify-center gap-6">
      <div className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3">
        <p className="text-xs uppercase tracking-widest text-zinc-500">
          Current Player
        </p>

        <h2
          className={`mt-1 text-2xl font-bold ${
            currentPlayer === "X"
              ? "text-cyan-400"
              : "text-orange-400"
          }`}
        >
          {currentPlayer}
        </h2>
      </div>

      <div className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3">
        <p className="text-xs uppercase tracking-widest text-zinc-500">
          Active Board
        </p>

        <h2 className="mt-1 text-2xl font-bold text-white">
          {activeBoard}
        </h2>
      </div>
    </div>
  );
}