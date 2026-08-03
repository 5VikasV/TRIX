type MatchPanelProps = {
  roomId: string;
  currentPlayer: "X" | "O";
  activeBoard: number | null;
  onLeave: () => void;
};

export default function MatchPanel({
  roomId,
  currentPlayer,
  activeBoard,
  onLeave,
}: MatchPanelProps) {
  return (
    <aside className="w-72 rounded-3xl border border-zinc-800 bg-[#1A1D22] p-6">

      <h2 className="mb-6 text-center text-lg font-bold tracking-widest text-zinc-300">
        MATCH
      </h2>

      <div className="space-y-5">

        <div className="rounded-2xl bg-[#15181C] p-4">
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            Room Code
          </p>

          <p className="mt-2 text-2xl font-black tracking-[0.2em]">
            {roomId}
          </p>
        </div>

        <div className="rounded-2xl bg-[#15181C] p-4">
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            Current Turn
          </p>

          <p
            className={`mt-2 text-3xl font-black ${
              currentPlayer === "X"
                ? "text-cyan-400"
                : "text-orange-400"
            }`}
          >
            {currentPlayer}
          </p>
        </div>

        <div className="rounded-2xl bg-[#15181C] p-4">
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            Active Board
          </p>

          <p className="mt-2 text-3xl font-black">
            {activeBoard === null
              ? "ANY"
              : activeBoard + 1}
          </p>
        </div>

        <button
          onClick={onLeave}
          className="
            w-full
            rounded-xl
            border
            border-red-500
            py-3
            font-bold
            text-red-400
            transition
            hover:bg-red-500
            hover:text-white
          "
        >
          Leave Match
        </button>

      </div>

    </aside>
  );
}