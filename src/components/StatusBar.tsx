import type { Player } from "../types/game";

type StatusBarProps = {
  currentPlayer: Player;
  activeBoard: number | null;
};

export default function StatusBar({
  currentPlayer,
  activeBoard,
}: StatusBarProps) {
  return (
    <div className="mt-8 flex gap-6">
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

        <h2 className="mt-1 text-2xl font-bold">
          {activeBoard === null ? "Any" : activeBoard + 1}
        </h2>
      </div>
    </div>
  );
}