import type { Player } from "../types/game";

type Props = {
  currentPlayer: Player;
  activeBoard: number | null;
};

export default function StatusBar({
  currentPlayer,
  activeBoard,
}: Props) {
  return (
    <section className="mb-10 flex gap-6">

      <div
        className="
          min-w-[180px]
          rounded-2xl
          border
          border-white/5
          bg-[#111113]
          px-6
          py-5
        "
      >
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
          Current Player
        </p>

        <h2
          className="
            mt-2
            text-3xl
            font-bold
            text-cyan-400
          "
        >
          {currentPlayer}
        </h2>
      </div>

      <div
        className="
          min-w-[180px]
          rounded-2xl
          border
          border-white/5
          bg-[#111113]
          px-6
          py-5
        "
      >
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
          Active Board
        </p>

        <h2 className="mt-2 text-3xl font-bold">
          {activeBoard === null ? "ANY" : activeBoard + 1}
        </h2>
      </div>

    </section>
  );
}