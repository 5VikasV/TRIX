import type { Player } from "../types/game";

type GameOverModalProps = {
  winner: Player | "Draw" | null;
  onRestart: () => void;
};

export default function GameOverModal({
  winner,
  onRestart,
}: GameOverModalProps) {
  if (!winner) return null;

  const title =
    winner === "Draw"
      ? "Draw!"
      : `${winner} Wins!`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[420px] rounded-3xl border border-zinc-700 bg-zinc-900 p-10 text-center shadow-2xl">

        <h1
          className={`text-5xl font-black ${
            winner === "X"
              ? "text-cyan-400"
              : winner === "O"
              ? "text-orange-400"
              : "text-zinc-300"
          }`}
        >
          {title}
        </h1>

        <button
          onClick={onRestart}
          className="mt-8 w-full rounded-xl bg-cyan-500 py-3 font-bold text-black transition hover:bg-cyan-400"
        >
          Play Again
        </button>

      </div>
    </div>
  );
}