type PlayerPanelProps = {
  myName?: string;
  opponentName?: string;
  isPlayerX: boolean;
  currentPlayer: "X" | "O";
  opponentLeft: boolean;
};

export default function PlayerPanel({
  myName,
  opponentName,
  isPlayerX,
  currentPlayer,
  opponentLeft,
}: PlayerPanelProps) {
  const mySymbol = isPlayerX ? "X" : "O";
  const opponentSymbol = isPlayerX ? "O" : "X";

  const isMyTurn = currentPlayer === mySymbol;

  return (
    <aside className="w-72 rounded-3xl border border-zinc-800 bg-[#1A1D22] p-6">
      <h2 className="mb-6 text-center text-lg font-bold tracking-widest text-zinc-300">
        PLAYERS
      </h2>

      <div className="space-y-4">

        <div className="rounded-2xl bg-[#15181C] p-5">
          <p
            className={`text-2xl font-bold ${
              mySymbol === "X"
                ? "text-cyan-400"
                : "text-orange-400"
            }`}
          >
            {myName} ({mySymbol})
          </p>
        </div>

        <div className="rounded-2xl bg-[#15181C] p-5">
          <p
            className={`text-2xl font-bold ${
              opponentSymbol === "X"
                ? "text-cyan-400"
                : "text-orange-400"
            }`}
          >
            {opponentLeft
              ? "Waiting..."
              : `${opponentName} (${opponentSymbol})`}
          </p>
        </div>

        <div className="rounded-2xl bg-[#15181C] p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
            TURN
          </p>

          <p
            className={`mt-2 text-2xl font-bold ${
              isMyTurn
                ? "text-green-400"
                : "text-orange-400"
            }`}
          >
            {isMyTurn
              ? "Your Turn"
              : "Opponent's Turn"}
          </p>
        </div>

      </div>
    </aside>
  );
}